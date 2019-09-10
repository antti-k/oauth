import React, { useEffect, useState } from 'react'
import axios from 'axios'

const App = () => {
	const [ auth, setAuth ] = useState(false)
	const [ userName, setUserName ] = useState('')
	 
	const clientId = '41e1a75acc0e9d6cb3c5'
	const redirectUri = 'http://localhost:3001/login'
	const loginUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`

	useEffect(() => {
		const authorize = async () => {
			const token = sessionStorage.getItem('token')
			const response = await axios.get('http://localhost:3001/auth', {
				headers: {
					authorization: token
				}
			})

			const { auth, userName } = response.data

			setAuth(auth)
			setUserName(userName)
		}
		authorize()
	}, [])

	const logOut = () => {
		sessionStorage.clear()
		setAuth(false)
	}

	if (auth) {
		return (
			<div>
				<p>You are {userName}</p>
				<button onClick={logOut}>Log out</button>
			</div>
		)
	} else {
		return (
			<div>
				<p>You are not logged in</p>
				<a href={loginUrl}>Log in</a>
			</div>
		)
	}
}

export default App
