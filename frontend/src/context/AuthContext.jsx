import { createContext, useContext, Component } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export class AuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true
    };
  }

  componentDidMount() {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      this.setState({ user: JSON.parse(savedUser) });
    }
    this.setState({ loading: false });
  }

  login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    this.setState({ user: userData });
  };

  logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setState({ user: null });
  };

  refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(data));
      this.setState({ user: data });
    } catch {}
  };

  render() {
    return (
      <AuthContext.Provider value={{ user: this.state.user, login: this.login, logout: this.logout, loading: this.state.loading, refreshUser: this.refreshUser }}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export const useAuth = () => useContext(AuthContext);
