import React, { useRef } from "react";
import content from "./data";
import "./JobCategories.css";

const importImage = (imageName) => {
  return require(`./images/${imageName}`);
};

const JobCategories = () => {
  const jobListRef = useRef(null); // 1. Ref for job list container

  const scrollLeft = () => {
    jobListRef.current.scrollBy({
      left: -300, // adjust scroll distance
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    jobListRef.current.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="jb-job-categories">
      <div className="jb-companylist">
        <h2 className="jb-heading">
          Trusted By <span className="jb-highlight1">1000+ Companies</span>
        </h2><br /><br />

        <div className="jb-company-logos">
          <div className="jb-logo-slider">
            {content.trustedBy.map((company, index) => (
              <img
                key={index}
                src={importImage(company.logo)}
                alt={company.name}
                className="jb-company-logo"
              />
            ))}
            {content.trustedBy.map((company, index) => (
              <img
                key={`dup-${index}`}
                src={importImage(company.logo)}
                alt={company.name}
                className="jb-company-logo"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="jb-jobs">
        <h2 className="jb-heading">
          Browse <span className="jb-highlight">Job </span> Category
        </h2><br /><br />
        <h5 className="jb-subheading">
          Explore diverse job opportunities tailored to your skills. Start your career journey today!
        </h5>

        <div className="jb-carousel-container">
          <button className="jb-arrow-btn jb-left" onClick={scrollLeft}>&lt;</button>
          <div className="jb-job-list" ref={jobListRef}>
            {content.jobCategories.map((job, index) => (
              <div key={index} className="jb-job-card">
                <img src={importImage(job.icon)} alt={job.title} className="jb-job-icon" />
                <h4 className="jb-job-title">{job.title}</h4><br/>
                <p className="jb-p1 jb-job-description">{job.description}</p>
              </div>
            ))}
          </div>
          <button className="jb-arrow-btn jb-right" onClick={scrollRight}>&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default JobCategories;
