import React from 'react';
import ContactCard from '../components/ContactCard';
import Logo from '../components/Logo';
import Navigation from '../components/Navigation';


const Contact = () => {
  const Contributor = [
      ["EL YATIMI Othmane", "othmane.el_yatimi@insa-cvl.fr", "/img/othmane.jpeg", "5A STI ASL/IA"],
      ["Jeremy Briffaut", "jeremy.briffaut@insa-cvl.fr", "/img/briffaut1.png", "Directeur departement STI"],
    ["RYANY Aymane", "aymane.ryany@insa-cvl.fr", "/img/ryany.jpeg", "5A STI ASL/IA"]

  ]

  return (
    <div className="header">
      < Navigation />
      < Logo />
      <ul className="divider columns is-multiline is-centered">
        {Contributor.map((contact) => (
          < ContactCard key={"Cards" + contact[0]} contact={contact} />
        ))}
      </ul>
    </div>
  );
};

export default Contact;
