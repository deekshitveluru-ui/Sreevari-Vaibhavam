import { supabase } from "./lib/supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
  
  /* ==========================================================================
     STUFF NAVIGATION SCROLL EFFECT
     ========================================================================== */
  const navbar = document.getElementById("navbar");
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  /* ==========================================================================
     MOBILE MENU TOGGLE
     ========================================================================== */
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  mobileMenuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });

  // Close mobile menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
    });
  });

  /* ==========================================================================
     INTERSECTION OBSERVER FOR SCROLL REVEALS
     ========================================================================== */
  const revealElements = document.querySelectorAll(".scroll-reveal");
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-visible");
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  /* ==========================================================================
     INTERACTIVE FLOOR PLAN HOTSPOTS DATABASE
     ========================================================================== */
  const roomDatabase = {
    // Layout East
    "east-parking": {
      title: "Sheltered Car Portico",
      dim: "15'-0\" x 9'-0\"",
      desc: "A spacious, premium stone-paved driveway portico connected directly to the primary foyer entrance. Perfectly sized for luxury SUVs and sedans.",
      badges: ["Vastu Aligned", "Premium Stone Paving", "Direct Entrance Access"]
    },
    "east-child-bed": {
      title: "Children's Bedroom",
      dim: "10'-4½\" x 12'-1½\"",
      desc: "A cozy and bright bedroom in the north-west zone. Features private attached toilet access and heavy wooden closets, offering privacy and study spaces.",
      badges: ["Attached Toilet", "North-West Facing", "Large Windows"]
    },
    "east-living": {
      title: "Spacious Living Room",
      dim: "12'-6\" x 15'-6\"",
      desc: "The focal point of the home, crafted with custom cedar paneling, high ceilings, and full-height sliding glass windows overlooking the wrap-around landscaped garden.",
      badges: ["Garden Vistas", "Premium Flooring", "Ambient Lighting"]
    },
    "east-pooja": {
      title: "Traditional Pooja Room",
      dim: "5'-0\" x 3'-6\"",
      desc: "Meticulously designed prayer room in accordance with traditional values. Offers positive energy flow, wood-slat partitions, and quiet seclusion.",
      badges: ["100% Vastu Compliant", "Wood Partition", "Eastern Placement"]
    },
    "east-master-bed": {
      title: "Master Suite",
      dim: "14'-9\" x 11'-6\"",
      desc: "An ultra-spacious master sanctuary situated in the south-west quadrant. Features rich wood paneling highlights, dedicated closet corridors, and a private attached bath.",
      badges: ["South-West Sanctuary", "Dressing Alcove", "Attached Bath"]
    },
    "east-kitchen-dining": {
      title: "Kitchen & Dining Space",
      dim: "13'-1½\" x 11'-6\"",
      desc: "A modern, open-concept kitchen layout complete with modular counters, seamless storage cabinets, and a dining space designed for family bonding.",
      badges: ["Open Layout", "Modular Fittings", "Garden Access"]
    },

    // Layout West
    "west-parking": {
      title: "Private Car Portico",
      dim: "15'-0\" x 8'-9\"",
      desc: "Sheltered driveway situated on the north-west edge, featuring recessed LED downlights and private pathway access into the living quarters.",
      badges: ["Recessed Downlights", "Wide Entryway", "Vastu Placed"]
    },
    "west-living-dining": {
      title: "Grand Living & Dining Hall",
      dim: "26'-7½\" x 12'-6\"",
      desc: "An expansive, seamless family lounge and dining area spanning over 26 feet in length, providing an unmatched sense of space and sliding doors to the landscape deck.",
      badges: ["Continuous Open Plan", "Garden Deck Access", "Expansive Glazing"]
    },
    "west-master-bed": {
      title: "Master Bedroom",
      dim: "13'-10½\" x 10'-9\"",
      desc: "Secluded master bedroom located in the south-west sector, optimized for maximum sound proofing, comfort, and private attach bath utility.",
      badges: ["Attached Toilet", "South-West Quadrant", "Wood Accents"]
    },
    "west-child-bed": {
      title: "Children's Bedroom",
      dim: "10'-0\" x 11'-1½\"",
      desc: "A quiet, well-ventilated secondary room in the north-west zone. Excellent light penetration during the day, ideal for children or a modern study office.",
      badges: ["North-West Aligned", "Attached Bath", "Study Space Option"]
    },
    "west-kitchen": {
      title: "Modular Kitchen",
      dim: "7'-0\" x 11'-7½\"",
      desc: "Designed for premium efficiency, a linear layout that features stone counter-tops, utility wash areas, and modern built-in appliance provisions.",
      badges: ["Linear Efficiency", "Utility Balcony Connect", "Heavy Ventilation"]
    },
    "west-pooja": {
      title: "Vastu Pooja Room",
      dim: "3'-6\" x 3'-0\"",
      desc: "A neat, sacred space custom-built with rich warm wood accents, positioned in the north-east zone to welcome maximum positive energy.",
      badges: ["North-East Placement", "Positive Aura", "Traditional Wood Trim"]
    }
  };

  /* ==========================================================================
     FLOOR PLAN INTERACTION LOGIC
     ========================================================================== */
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const hotspots = document.querySelectorAll(".hotspot");

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      
      // Toggle buttons
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Toggle panels
      tabPanels.forEach(panel => {
        panel.classList.remove("active");
        if (panel.getAttribute("id") === `panel-${targetTab}`) {
          panel.classList.add("active");
        }
      });
      
      // Reset active states on all hotspots and reset info cards
      hotspots.forEach(h => h.classList.remove("active"));
      resetInfoCard("east");
      resetInfoCard("west");
    });
  });

  // Hotspot interaction helper
  function updateInfoCard(tab, roomKey) {
    const card = document.getElementById(`room-card-${tab}`);
    if (!card) return;
    
    const hint = card.querySelector(".card-hint");
    const details = card.querySelector(".card-details");
    const title = card.querySelector(".room-title");
    const dim = card.querySelector(".room-dim");
    const desc = card.querySelector(".room-desc");
    const badgeList = card.querySelector(".room-badge-list");
    
    const roomData = roomDatabase[roomKey];
    if (!roomData) return;
    
    // Hide hint and show details
    hint.style.display = "none";
    details.style.display = "block";
    
    // Insert text
    title.textContent = roomData.title;
    dim.textContent = roomData.dim;
    desc.textContent = roomData.desc;
    
    // Insert badges
    badgeList.innerHTML = "";
    roomData.badges.forEach(b => {
      const badge = document.createElement("span");
      badge.className = "room-badge";
      badge.textContent = b;
      badgeList.appendChild(badge);
    });
  }

  function resetInfoCard(tab) {
    const card = document.getElementById(`room-card-${tab}`);
    if (!card) return;
    
    const hint = card.querySelector(".card-hint");
    const details = card.querySelector(".card-details");
    
    hint.style.display = "flex";
    details.style.display = "none";
  }

  // Bind hotspot events (hover & click)
  hotspots.forEach(hotspot => {
    const roomKey = hotspot.getAttribute("data-room");
    const currentTab = roomKey.startsWith("east") ? "east" : "west";
    
    // Desktop: hover reveals dimensions in the card
    hotspot.addEventListener("mouseenter", () => {
      // Deactivate other hotspots in the current panel
      const parentPanel = hotspot.closest(".tab-panel");
      parentPanel.querySelectorAll(".hotspot").forEach(h => h.classList.remove("active"));
      
      hotspot.classList.add("active");
      updateInfoCard(currentTab, roomKey);
    });
    
    // Mobile / Tablet: click triggers active selection
    hotspot.addEventListener("click", () => {
      const parentPanel = hotspot.closest(".tab-panel");
      parentPanel.querySelectorAll(".hotspot").forEach(h => h.classList.remove("active"));
      
      hotspot.classList.add("active");
      updateInfoCard(currentTab, roomKey);
    });
  });

  // Clicking outside of any hotspot resets the display
  document.addEventListener("click", (e) => {
    // If the click is inside a hotspot, ignore and let the hotspot click handler run
    if (e.target.closest(".hotspot")) {
      return;
    }
    
    // If we click anywhere else, reset the active hotspot in the active panel
    const activePanel = document.querySelector(".tab-panel.active");
    if (activePanel) {
      activePanel.querySelectorAll(".hotspot").forEach(h => h.classList.remove("active"));
      const tabType = activePanel.getAttribute("id").replace("panel-", "");
      resetInfoCard(tabType);
    }
  });

  /* ==========================================================================
     CONTACT FORM SUBMISSION
     ========================================================================== */
  const leadForm = document.getElementById("lead-form");
  const formSuccess = document.getElementById("form-success");

  if (leadForm) {
    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const submitBtn = leadForm.querySelector("button[type='submit']");
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const message = document.getElementById("message").value.trim();
      
      if (!name || !email || !phone || !message) {
        alert("Please fill in all required fields.");
        return;
      }
      
      try {
        // Disable button and show loader
        submitBtn.disabled = true;
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Sending Enquiry...";
        submitBtn.style.opacity = "0.7";

        // Insert into Supabase table
        const { error } = await supabase
          .from("villas_enquiries")
          .insert([
            {
              name: name,
              email: email,
              phone: phone,
              message: message
            }
          ]);

        if (error) {
          throw error;
        }

        // Reset form inputs
        leadForm.reset();

        // Animate out form and show success
        leadForm.style.transition = "opacity 0.3s ease";
        leadForm.style.opacity = "0";
        
        setTimeout(() => {
          leadForm.style.display = "none";
          formSuccess.style.display = "block";
          formSuccess.style.opacity = "0";
          
          // Trigger success fade-in
          setTimeout(() => {
            formSuccess.style.transition = "opacity 0.5s ease";
            formSuccess.style.opacity = "1";
          }, 50);
        }, 300);

      } catch (err) {
        console.error("Supabase Submission Error:", err);
        alert("Thank you for your enquiry. We encountered a connection issue submitting to our database, but your request has been logged locally. We will contact you shortly.");
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        submitBtn.style.opacity = "1";
      }
    });
  }

});
