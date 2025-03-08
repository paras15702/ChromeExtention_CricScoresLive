import React, { useState, useEffect } from 'react';
import axios, { all } from 'axios';

const AllMatches = () => {
    const [matchData, setMatchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('International');
    const options = {
        method: 'GET',
        url: 'https://cricbuzz-cricket.p.rapidapi.com/matches/v1/recent',
        headers: {
            'x-rapidapi-key': import.meta.env.VITE_KEY,
            'x-rapidapi-host': import.meta.env.VITE_HOST
        }
    };
    useEffect(() => {
        const fetchCricketData = async () => {
            try {
                setLoading(true);
                // Replace this URL with your actual API endpoint
                const response = await axios.request(options);
                setMatchData(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching cricket data. Please try again later.');
                setLoading(false);
                console.error('Error fetching data:', err);
            }
        };

        fetchCricketData();
    }, []);

    // Function to format date from timestamp
    const formatDate = (timestamp) => {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Helper function to determine match result text
    const getMatchResult = (match) => {
        if (match.matchInfo.status) {
            return match.matchInfo.status;
        }
        return match.matchInfo.state;
    };

    if (loading) return <div className="text-center p-4">Loading cricket scores...</div>;
    if (error) return <div className="text-center p-4 text-red-600">{error}</div>;
    if (!matchData) return <div className="text-center p-4">No data available</div>;

    // Get unique match types from data
    const matchTypes = matchData?.typeMatches?.map(type => type.matchType) || [];

    // Get current matches for the selected tab
    const getCurrentMatches = () => {
        const matchTypeData = matchData?.typeMatches?.find(type => type.matchType === activeTab);
        if (!matchTypeData) return [];

        // Flatten the series matches
        const allMatches = [];
        matchTypeData.seriesMatches.forEach(seriesMatch => {
            if (seriesMatch.seriesAdWrapper && seriesMatch.seriesAdWrapper.matches) {
                allMatches.push(...seriesMatch.seriesAdWrapper.matches);
            }
        });

        return allMatches;
    };

    const currentMatches = getCurrentMatches();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Live Cricket Scores</h1>

            {/* Tabs for match types */}
            <div className="flex border-b mb-4">
                {matchTypes.map(type => (
                    <button
                        key={type}
                        className={`py-2 px-4 ${activeTab === type ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                        onClick={() => setActiveTab(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Match list */}
            <div className="space-y-4">
                {currentMatches.length > 0 ? (
                    currentMatches.map((match, index) => (
                        <div key={index} className="border rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-sm text-gray-500">
                                    {match.matchInfo.seriesName} - {match.matchInfo.matchDesc}
                                </div>
                                <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {match.matchInfo.matchFormat}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="font-medium">{match.matchInfo.team1.teamName}</div>
                                    <div className="text-sm">
                                        {match.matchScore?.team1Score?.inngs1 &&
                                            `${match.matchScore.team1Score.inngs1.runs}/${match.matchScore.team1Score.inngs1.wickets} (${match.matchScore.team1Score.inngs1.overs})`}
                                    </div>
                                </div>
                                <span className="text-xs px-2">vs</span>
                                <div className="flex items-center space-x-3">
                                    <div className="font-medium">{match.matchInfo.team2.teamName}</div>
                                    <div className="text-sm">
                                        {match.matchScore?.team2Score?.inngs1 &&
                                            `${match.matchScore.team2Score.inngs1.runs}/${match.matchScore.team2Score.inngs1.wickets} (${match.matchScore.team2Score.inngs1.overs})`}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm">
                                <div className="text-gray-500">
                                    {match.matchInfo.venueInfo?.ground}, {match.matchInfo.venueInfo?.city}
                                </div>
                                <div className={`${match.matchInfo.state === "Complete" ? "text-green-600 font-medium" : "text-orange-500"}`}>
                                    {getMatchResult(match)}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">No matches found for this category</div>
                )}
            </div>
        </div>
    );
};

export default AllMatches;