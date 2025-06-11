export async function getHome(setSummary: any, setError: any) {
  await fetch('/api/home', {
    method: 'GET',
    headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {},
  })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    })
    .then((data) => {
      setSummary(data);
    })
    .catch((err) => {
      console.error(err);
      setError('Failed to load dashboard data.');
    });
}
