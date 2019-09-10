'use strict';
require('dotenv').config()

const Hapi = require('hapi')
const Path = require('path')
const Inert = require('inert')
const axios = require('axios')
const jwt = require('jsonwebtoken')


const server = Hapi.server({
    host: '0.0.0.0',
    port: process.env.PORT
})


const start =  async function() {
  await server.register(Inert)

  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
      directory: {
        path: Path.join(__dirname, './oauth-react/build/'),
        listing: false,
        index: true
      }
    }
  })

	server.route({
		method:'GET',
		path:'/auth',
		handler: async (request, h) => {
			let auth = false
			let userName = ''
			try {
				const token = request.headers.authorization
				const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
				auth = true
				userName = decodedToken.login
			} catch(error) {
				// console.log(error)
			}

			const response = {
				auth,
				userName
			}
			return response
		}
	});

  server.route({
    method:'GET',
		path:'/login',
		handler: async (request, h) => {

			const clientId = process.env.CLIENT_ID
			const clientSecret = process.env.CLIENT_SECRET

			const { code } = request.query
			console.log({ code })

			const response = await axios.post(`https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`)

			const responseData = response.data
			console.log({ responseData })

			const token = response.data.split('&')[0].split('=')[1]

			const githubUser = await axios.get(`https://api.github.com/user?client_id=${clientId}&client_secret=${clientSecret}`, {
				headers: {
					Authorization: `token ${token}`,
					'User-Agent': 'oauth-demo'
				}
			})

			const githubUserData = githubUser.data
			console.log({ githubUserData })
			const { id, login } = githubUser.data
			const userForToken = {
				id,
				login
			}
			const jwtToken = jwt.sign(userForToken, process.env.JWT_SECRET)

			console.log({jwtToken})

			return (
				`<script>const main = async () => {await sessionStorage.setItem('token', '${jwtToken}');window.location.href = 'http://localhost:3001'};main();</script>`
			)
    }

  })

  try {
    await server.start()
  }
  catch (err) {
    console.log(err)
    process.exit(1)
  }

  console.log('Server running at:', server.info.uri)
}

start()
