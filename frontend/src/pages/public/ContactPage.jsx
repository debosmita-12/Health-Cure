import { useState } from "react";
import { ArrowRightIcon, CheckIcon, LockIcon, ShieldIcon } from "../../components/icons/icons";

const empty = { name: "", email: "", phone: "", subject: "General Inquiry", message: "" };

export default function ContactPage() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  function update(event) {
    setSaved(false);
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function validate() {
    const next = {};
    if (values.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (values.message.trim().length < 10) next.message = "Please write a message of at least 10 characters.";
    return next;
  }

  function submit(event) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const existing = JSON.parse(localStorage.getItem("hc-messages") || "[]");
    existing.push({
      ...values,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem("hc-messages", JSON.stringify(existing));
    setValues(empty);
    setSaved(true);
  }

  return (
    <section className="subpage contact-page">
      <div className="container form-layout">
        <div className="subpage-intro">
          <p className="eyebrow-text">GET IN TOUCH</p>
          <h1 className="subpage-title">
            Connect with
            <br />
            <span>Health &amp; Cure.</span>
          </h1>
          <p className="subpage-desc">
            Have questions regarding clinical appointments, patient record privacy, or physician credential
            onboarding? Our care coordinators and technical support team are here to assist.
          </p>

          <div className="contact-details-card">
            <div className="contact-info-item">
              <span className="contact-icon"><ShieldIcon size={20} /></span>
              <div>
                <strong>Super Speciality Hospital Campus</strong>
                <p>Sector V, Salt Lake, Kolkata, West Bengal - 700091, India</p>
              </div>
            </div>
            <div className="contact-info-item">
              <span className="contact-icon"><ShieldIcon size={20} /></span>
              <div>
                <strong>Helpline &amp; Support Desk</strong>
                <p>+91 9051579029 | Mon–Sat: 08:00 – 20:00</p>
              </div>
            </div>
            <div className="contact-info-item">
              <span className="contact-icon"><ShieldIcon size={20} /></span>
              <div>
                <strong>Clinical Coordination Desk</strong>
                <p>care@healthcure.local | Mon–Sat: 08:00 – 20:00</p>
              </div>
            </div>
            <div className="contact-info-item">
              <span className="contact-icon"><LockIcon size={20} /></span>
              <div>
                <strong>Data Protection &amp; Privacy Officer</strong>
                <p>privacy@healthcure.local | Response within 24h</p>
              </div>
            </div>
          </div>
        </div>

        <div className="form-card-container">
          <form className="panel-form" onSubmit={submit} noValidate>
            <div className="panel-form-header">
              <h2>Send Us a Message</h2>
              <p>We typically respond to patient and clinical inquiries within 2 hours.</p>
            </div>

            <div className="form-row-2">
              <label>
                Full Name *
                <input
                  name="name"
                  value={values.name}
                  onChange={update}
                  placeholder="e.g. Debosmita Mukhopadhyay"
                  required
                />
                {errors.name && <small>{errors.name}</small>}
              </label>

              <label>
                Email Address *
                <input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={update}
                  placeholder="name@example.com"
                  required
                />
                {errors.email && <small>{errors.email}</small>}
              </label>
            </div>

            <div className="form-row-2">
              <label>
                Phone Number
                <input
                  name="phone"
                  type="tel"
                  value={values.phone}
                  onChange={update}
                  placeholder="+91 9051579029"
                />
              </label>

              <label>
                Inquiry Topic
                <select name="subject" value={values.subject} onChange={update}>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Appointment Booking">Appointment Booking Help</option>
                  <option value="Medical Records">Medical Records &amp; Consent</option>
                  <option value="Doctor Verification">Doctor Credential Verification</option>
                  <option value="Privacy Question">Privacy &amp; Security Question</option>
                </select>
              </label>
            </div>

            <label>
              Your Message *
              <textarea
                name="message"
                rows="5"
                value={values.message}
                onChange={update}
                placeholder="How can our clinical team help you today?"
                required
              />
              {errors.message && <small>{errors.message}</small>}
            </label>

            <button className="btn btn-primary btn-block" type="submit">
              Send Message <ArrowRightIcon size={14} />
            </button>

            {saved && (
              <div className="form-success-banner" role="status">
                <CheckIcon size={18} />
                <span>Thank you! Your message has been received by our clinical coordination team.</span>
              </div>
            )}

            <p className="secure-note">
              <LockIcon size={14} /> Messages are handled under strict confidentiality protocols.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
