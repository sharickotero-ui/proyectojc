
import { useState } from 'react'
import { iniciarSesionAdmin } from '../api.js'

function LoginAdmin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function manejarInicioSesion(e) {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const resultado = await iniciarSesionAdmin({
        email,
        password,
      })

      if (!resultado.token) {
        throw new Error('La API no devolvió un token válido')
      }

      sessionStorage.setItem('adminToken', resultado.token)
      window.location.hash = 'admin-panel'
    } catch (error) {
      setError(error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="login-admin animate__animated animate__fadeInUp">
      <h1>Administración Bite&Go</h1>
      <p>Ingresa tus credenciales de administrador.</p>
      <a className="login-volver" href="#inicio">← Volver a Bite&Go</a>

      <form onSubmit={manejarInicioSesion}>
        <label htmlFor="admin-email">Correo electrónico</label>
        <input
          id="admin-email"
          name="email"
          autoComplete="username"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="admin-password">Contraseña</label>
        <input
          id="admin-password"
          name="password"
          autoComplete="current-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>
    </section>
  )
}

export default LoginAdmin
