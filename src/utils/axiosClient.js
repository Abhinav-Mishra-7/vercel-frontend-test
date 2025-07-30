import axios from 'axios'

// axios.create({}) -> This creates an instance so that we can use this configuration everywhere and no need to create oftenly.
const axiosClient = axios.create({
  baseURL: 'https://vercel-backend-test-five.vercel.app',
  // withCredentials: true -> browser will add tokens or cookies automatically with the credentials
  withCredentials: true ,
  // 'Content-Type' : 'application/json' -> Content will go in json formate to backend from frontend
  headers: {
    'Content-Type' : 'application/json' ,
    Accept: 'application/json'
  }
});

axiosClient.interceptors.response.use(
    response => response,
    error => {
        return Promise.reject(error.response?.data || error.message);
    }
);


// Add to submission API call
export const submitSolution = async (contestId, problemId, code) => {
  const response = await axiosClient.post('/api/submissions', {
    contestId,
    problemId,
    code
  });
  
  // If accepted, return success
  if (response.data.status === 'Accepted') {
    return { success: true, data: response.data };
  }
  
  return { success: false, error: response.data };
};

export default axiosClient ;