import React from 'react'

export default function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Sommy's Store</h1>
        <p className="lead">We curate everyday apparel and accessories designed for comfort, longevity and effortless style.</p>
      </div>

      <div className="about-content">
        <section>
          <h3>Our mission</h3>
          <p>
            To bring thoughtfully designed, high-quality products to your wardrobe without the fuss. We focus on
            durable materials, considered details, and straightforward prices.
          </p>
        </section>

        <section>
          <h3>What we stand for</h3>
          <ul>
            <li>Quality-first sourcing</li>
            <li>Simple, timeless design</li>
            <li>Customer-focused service</li>
          </ul>
        </section>

        <section>
          <h3>Get in touch</h3>
          <p>If you have questions, collaborations, or feedback — email us at <a href="mailto:hello@sommys.store">hello@sommys.store</a>.</p>
        </section>
      </div>
    </div>
  )
}
