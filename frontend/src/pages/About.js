import Navigation from "../components/Navigation";

const About = () => {
  return (
    <div className="header">
      <Navigation />
      <h1 className="title">About</h1>
      <p className="divider basic-text">
        We are two fifth year
        <a href="https://www.insa-centrevaldeloire.fr/" target="_blank" >
          <span className="red bold" href="https://www.insa-centrevaldeloire.fr/">
            {" " + "INSACVL" + " "}
          </span>
        </a>
        students from Bourges who are trying to bring an infosec atmosphere at INSA CVL because we think each INSA student should have the basis, whether it’s to secure their own programs or acquire thorough knowledge for future business.
      </p>
    </div>
  );
};

export default About;
