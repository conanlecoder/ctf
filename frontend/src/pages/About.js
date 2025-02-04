import Navigation from "../components/Navigation";

const About = () => {
  return (
    <div className="header">
      <Navigation />
      <h1 className="title">About</h1>
      <p className="divider basic-text">
        We are four first year
        <a href="https://www.INSACVL.eu/" target="_blank" >
          <span className="blue bold" href="https://www.INSACVL.eu/">
            {" " + "INSACVL" + " "}
          </span>
        </a>
        students from Bourges who are trying to bring an infosec atmosphere at INSA CVL because we think each INSA student should have the basis, whether it’s to secure their own programs or acquire thorough knowledge for future business.
      </p>
      <img src="/img/sys_new.jpg" className="divider" alt="Placeholder image" />
    </div>
  );
};

export default About;
