import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer le refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await api.post('/auth/logout/', { refresh_token: refreshToken });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  changePassword: async ({ old_password, new_password }) => {
    const response = await api.post('/auth/change_password/', { old_password, new_password });
    return response.data;
  },
};

// Services utilisateurs
export const userService = {
  getAll: async () => {
    const response = await api.get('/users/');
    return response.data.results || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}/`, userData);
    return response.data;
  },

  patch: async (id, userData) => {
    const response = await api.patch(`/users/${id}/`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}/`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },
};

// Services professeurs
export const professeurService = {
  getAll: async () => {
    const response = await api.get('/professeurs/');
    return response.data.results || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/professeurs/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/professeurs/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/professeurs/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/professeurs/${id}/`);
    return response.data;
  },

  getProfilComplet: async () => {
    const response = await api.get('/professeurs/profil_complet/');
    return response.data;
  },
};

// Services académiques
export const anneeScolaireService = {
  getAll: async () => {
    const response = await api.get('/academic/annees-scolaires/');
    return response.data.results || response.data;
  },

  getActive: async () => {
    const response = await api.get('/academic/annees-scolaires/active/');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/academic/annees-scolaires/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/academic/annees-scolaires/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/academic/annees-scolaires/${id}/`);
    return response.data;
  },
};

export const classeService = {
  getAll: async (params = {}) => {
    const response = await api.get('/academic/classes/', { params });
    // Gérer le format paginé de Django REST Framework
    return response.data.results || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/academic/classes/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/academic/classes/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/academic/classes/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/academic/classes/${id}/`);
    return response.data;
  },

  getEleves: async (id) => {
    const response = await api.get(`/academic/classes/${id}/eleves/`);
    return response.data;
  },

  addMatiere: async (id, data) => {
    const response = await api.post(`/academic/classes/${id}/add_matiere/`, data);
    return response.data;
  },
};

export const matiereService = {
  getAll: async () => {
    const response = await api.get('/academic/matieres/');
    return response.data.results || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/academic/matieres/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/academic/matieres/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/academic/matieres/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/academic/matieres/${id}/`);
    return response.data;
  },
};

export const eleveService = {
  getAll: async (params = {}) => {
    const response = await api.get('/academic/eleves/', { params });
    // Gérer le format paginé de Django REST Framework
    return response.data.results || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/academic/eleves/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/academic/eleves/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/academic/eleves/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/academic/eleves/${id}/`);
    return response.data;
  },

  importCSV: async (formData) => {
    const response = await api.post('/academic/eleves/import_csv/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getTemplateCSV: async () => {
    const response = await api.get('/academic/eleves/template_csv/', {
      responseType: 'blob',
    });
    return response.data;
  },

  getTemplateExcel: async () => {
    const response = await api.get('/academic/eleves/template_excel/', {
      responseType: 'blob',
    });
    return response.data;
  },

  proposerPassage: async (eleveId, statut) => {
    const response = await api.patch(`/academic/eleves/${eleveId}/proposer_passage/`, { statut });
    return response.data;
  },

  passageClasse: async (eleves, nouvelleClasse, statut = 'actif') => {
    const response = await api.post('/academic/eleves/passage_classe/', {
      eleves,
      nouvelle_classe: nouvelleClasse,
      statut
    });
    return response.data;
  },
};

// Services de gestion des notes (Module 3)
export const periodeService = {
  getAll: async () => {
    const response = await api.get('/grades/periodes/');
    return response.data.results || response.data;
  },

  getActive: async () => {
    const response = await api.get('/grades/periodes/?non_cloturees=true');
    return response.data;
  },

  cloturer: async (id) => {
    const response = await api.post(`/grades/periodes/${id}/cloturer/`);
    return response.data;
  },
};

export const typeEvaluationService = {
  getAll: async () => {
    const response = await api.get('/grades/types-evaluation/');
    return response.data.results || response.data;
  },
};

export const noteService = {
  getAll: async (params = {}) => {
    const response = await api.get('/grades/notes/', { params });
    return response.data.results || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/grades/notes/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/grades/notes/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/grades/notes/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/grades/notes/${id}/`);
    return response.data;
  },

  saisieRapide: async (data) => {
    const response = await api.post('/grades/notes/saisie_rapide/', data);
    return response.data;
  },
};

export const moyenneService = {
  getAll: async (params = {}) => {
    const response = await api.get('/grades/moyennes/', { params });
    return response.data.results || response.data;
  },

  getMoyenneGenerale: async (eleveId, periodeId) => {
    const response = await api.get('/grades/moyennes/moyenne_generale/', {
      params: { eleve: eleveId, periode: periodeId }
    });
    return response.data;
  },

  getClasseMoyennes: async (params = {}) => {
    const response = await api.get('/grades/moyennes/classe_moyennes/', { params });
    return response.data;
  },

  getBulletinsClasse: async (classeId, periodeId) => {
    const response = await api.get('/grades/moyennes/bulletins_classe/', {
      params: { classe: classeId, periode: periodeId }
    });
    return response.data;
  },

  recalculer: async (periodeId) => {
    const response = await api.post('/grades/moyennes/recalculer/', {
      periode_id: periodeId
    });
    return response.data;
  },
};

export default api;
