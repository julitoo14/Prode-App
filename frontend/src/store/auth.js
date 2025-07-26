import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const isAuthenticated = ref(!!localStorage.getItem('token'));
const user = ref(null);

export function useAuth() {
  const router = useRouter();

  const setAuthenticated = (value) => {
    isAuthenticated.value = value;
  };

  const setUser = (userData) => {
    user.value = userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    setUser(null);
    router.push('/public');
  };

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    user: computed(() => user.value),
    setAuthenticated,
    setUser,
    logout,
  };
}
