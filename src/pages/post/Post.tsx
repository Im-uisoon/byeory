import React from 'react';
import Navigation from '../../components/Header/Navigation';

const Post: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900">포스트 페이지</h1>
            </div>
        </div>
    );
};

export default Post;
