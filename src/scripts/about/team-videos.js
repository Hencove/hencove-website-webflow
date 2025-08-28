import { R2_BASE_URL } from "../../config.js";

function initTeamVideos() {
  const teamMembers = document.querySelectorAll(".about-team_team-member");

  if (!teamMembers.length) return;

  teamMembers.forEach((member) => {
    const slugLink = member.querySelector(".team-member-slug");
    const href = slugLink.getAttribute("href");
    const slugPortion = href.split("/").pop();
    const video = member.querySelector(".teamClip");
    const photo = member.querySelector(".team-member_photo");

    if (video && slugPortion) {
      const isSafari = () => {
        const ua = navigator.userAgent.toLowerCase();
        return (
          ua.includes("safari") &&
          !ua.includes("chrome") &&
          !ua.includes("chromium") &&
          !ua.includes("android")
        );
      };

      const videoSrc = isSafari()
        ? `${R2_BASE_URL}/team-video/hevc/${slugPortion}.mov`
        : `${R2_BASE_URL}/team-video/webm/${slugPortion}.webm`;
      video.src = videoSrc;

      member.addEventListener("mouseenter", () => {
        video.play();
        photo.style.opacity = 0;
        video.style.opacity = 1;
      });

      member.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0;
        photo.style.opacity = 1;
        video.style.opacity = 0;
      });
    }
  });
}

// Check if DOM is ready, if not wait for it
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTeamVideos);
} else {
  // DOM is already ready
  initTeamVideos();
}
