import { useQuery } from '@tanstack/react-query';

const fetchAdventInput = async (year:number,day:number): Promise<string> => {
    const response = await fetch(`https://adventofcode.com/${year}/day/${day}/input`, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch input: ${response.statusText}`);
    }
  
    return response.text(); // Assuming the response is plain text
  };

export const useAdventInputQuery = (year: number, day: number) => {
  return useQuery({ 
        queryKey: ['fetchAdventInput', year, day], 
        queryFn: () => fetchAdventInput(year, day),
        refetchOnWindowFocus: false,        
    });
};