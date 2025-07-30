import { useCallback } from "react";

const FetchContest = ({id}) => {

    const [contest, setContest] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);

    const fetchContest = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get(`/contest/${id}`);
      setContest(data.contest);
      setIsRegistered(data.isRegistered);
      setStatus(data.status);
      setError(null);
    } catch (err) {
      if (err.missed) {
        setError(err) ;
      } else {
        setError(err.message || 'Contest not found or could not be loaded.');
      }
      
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContest();
  }, [fetchContest]);

  return(
    <>{contest}</>
  )

}

export default FetchContest ;