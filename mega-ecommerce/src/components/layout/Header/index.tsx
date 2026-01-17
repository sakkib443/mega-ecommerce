import React from 'react';
import TopHeader from './TopHeader';
import MinHeader from './MinHeader';
import Navbar from './Navbar';

const Header: React.FC = () => {
    return (
        <header>
            <TopHeader />
            <MinHeader />
            <Navbar />
        </header>
    );
};

export default Header;
export { TopHeader, MinHeader, Navbar };
