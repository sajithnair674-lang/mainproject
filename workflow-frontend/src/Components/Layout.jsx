import Navbar from "./Navbar";

function Layout({ children }) {
    return (
        <div className="workflow-layout">
            <Navbar />

            <main className="workflow-main">
                {children}
            </main>
        </div>
    );
}

export default Layout;