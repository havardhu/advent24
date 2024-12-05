import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import { lightTheme, darkTheme } from './theme';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Day5 } from './components/day5/Day5';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const Home: React.FC = () => <h1 className="text-center text-2xl">Home Page</h1>;
const NotFound: React.FC = () => <h1 className="text-center text-2xl">404 - Not Found</h1>

const queryClient = new QueryClient();

const App: React.FC = () => {
    const [darkMode, setDarkMode] = useState<boolean>(true);

    // const toggleTheme = () => {
    //     setDarkMode((prev) => !prev);
    //     // Add or remove the 'dark' class for Tailwind
    //     if (darkMode) {
    //         document.documentElement.classList.remove('dark');
    //     } else {
    //         document.documentElement.classList.add('dark');
    //     }
    // };

    return (
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <div className="min-h-screen flex flex-col">
                    <Router>
                        <nav className="flex space-x-4 p-4">
                            <Link to="/" className="text-blue-500"><Button variant="text" color="primary">Home</Button></Link>
                            <Link to="/day5" className="text-blue-500"><Button variant="text" color="primary">Day 5</Button></Link>
                        </nav>
                        <div className="p-4">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/day5" element={<Day5 />} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </div>
                    </Router>
                </div>
            </QueryClientProvider>
        </ThemeProvider>
    );
};

export default App;
