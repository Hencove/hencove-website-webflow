function initTeamVideos() {
  const teamMembers = document.querySelectorAll(".about-team_team-member");

  if (!teamMembers.length) return;

  teamMembers.forEach((member) => {
    const video = member.querySelector(".teamClip");
    const photo = member.querySelector(".team-member_photo");

    if (video && video.hasAttribute("src") && video.src !== "") {
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
