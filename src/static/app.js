document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API and render them
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";
      activitySelect.innerHTML = "";

      const defaultOption = document.createElement('option');
      defaultOption.value = "";
      defaultOption.textContent = "Select an activity";
      activitySelect.appendChild(defaultOption);

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const title = document.createElement('h4');
        title.textContent = name;

        const desc = document.createElement('p');
        desc.textContent = details.description;

        const schedule = document.createElement('p');
        schedule.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const avail = document.createElement('p');
        avail.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        const participantsLabel = document.createElement('p');
        participantsLabel.innerHTML = '<strong>Participants:</strong>';

        const ul = document.createElement('ul');
        details.participants.forEach(participant => {
          const li = document.createElement('li');
          li.textContent = participant;

          const del = document.createElement('span');
          del.className = 'delete-icon';
          del.textContent = '🗑️';
          del.addEventListener('click', () => deleteParticipant(participant, name));

          li.appendChild(del);
          ul.appendChild(li);
        });

        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(schedule);
        activityCard.appendChild(avail);
        activityCard.appendChild(participantsLabel);
        activityCard.appendChild(ul);

        activitiesList.appendChild(activityCard);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Delete (unregister) participant
  async function deleteParticipant(email, activityName) {
    try {
      const resp = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });

      if (resp.ok) {
        await fetchActivities();
      } else {
        alert('Failed to unregister participant');
      }
    } catch (err) {
      console.error('Error unregistering participant:', err);
      alert('Failed to unregister participant');
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
