const Logo = () => {
    const text = {
        color: 'red', // Set text color to red
        fontWeight: 'bold', // Make the text bold
    };

    return (
        <div className="logo">
            <img className="image is-rounded has-image-centered" src="/img/logo.png" alt="logo" />
            <h3 style={text}>INSA CTF</h3>
        </div>
    );
};

export default Logo;
