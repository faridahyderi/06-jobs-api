import { enableInput, inputEnabled, message, setDiv, token } from "./index.js";
import { showJobs } from "./jobs.js";

let addEditDiv = null;
let company = null;
let position = null;
let status = null;
let addingJob = null;

export const handleAddEdit = () => {
    addEditDiv = document.getElementById("edit-job");
    company = document.getElementById("company");
    position = document.getElementById("position");
    status = document.getElementById("status");
    addingJob = document.getElementById("adding-job");
    const editCancel = document.getElementById("edit-cancel");
  
    document.addEventListener("click", async (e) => {
      if (inputEnabled && e.target.nodeName === "BUTTON") {
        if (e.target === addingJob) {
          enableInput(false);
  
          let method = "POST";
          let url = "/api/v1/jobs";
  
          if (addingJob.textContent === "update") {
            method = "PATCH";
            url = `/api/v1/jobs/${addEditDiv.dataset.id}`; // Fixed syntax
          }
  
          try {
            const response = await fetch(url, {
              method: method,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                company: company.value,
                position: position.value,
                status: status.value,
              }),
            });
  
            const data = await response.json();
            if (response.status === 200 || response.status === 201) {
              message.textContent =
                response.status === 200
                  ? "The job entry was updated."
                  : "The job entry was created.";
  
              // Clear form fields
              company.value = "";
              position.value = "";
              status.value = "pending";
  
              // Refresh jobs list
              showJobs();
            } else {
              message.textContent = data.msg || "An unexpected error occurred.";
            }
          } catch (err) {
            console.error(err);
            message.textContent = "A communication error occurred.";
          }
  
          enableInput(true);
        } else if (e.target === editCancel) {
          // Clear fields and return to jobs list
          company.value = "";
          position.value = "";
          status.value = "pending";
          message.textContent = "";
          showJobs();
        } else if (e.target.id === "delete-job") {
          // Handle delete operation
          const jobId = addEditDiv.dataset.id; // Assuming delete buttons have a `data-id` attribute
          const confirmDelete = confirm(
            "Are you sure you want to delete this job entry?"
          );
  
          if (confirmDelete) {
            try {
              const response = await fetch(`/api/v1/jobs/${jobId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });
  
              const data = await response.json();
              if (response.status === 200) {
                message.textContent = data.msg || "The entry was deleted.";
                showJobs(); // Refresh the jobs list
              } else {
                message.textContent =
                  data.msg || "Failed to delete the job entry.";
              }
            } catch (err) {
              console.error(err);
              message.textContent = "A communication error occurred.";
            }
          }
        }
      }
    });
  };

export const showAddEdit = async (jobId) => {
  if (!jobId) {
    // Add new job
    company.value = "";
    position.value = "";
    status.value = "pending";
    addingJob.textContent = "add";
    message.textContent = "";

    setDiv(addEditDiv);
  } else {
    // Edit existing job
    enableInput(false);

    try {
      const response = await fetch(`/api/v1/jobs/${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status === 200) {
        company.value = data.job.company;
        position.value = data.job.position;
        status.value = data.job.status;
        addingJob.textContent = "update";
        message.textContent = "";
        addEditDiv.dataset.id = jobId;

        setDiv(addEditDiv);
      
      let deleteButton = document.getElementById("delete-job");
       if (!deleteButton) {
          deleteButton = document.createElement("button");
          deleteButton.type = "button";
          deleteButton.id = "delete-job";
          deleteButton.textContent = "delete";
          deleteButton.dataset.id = jobId;
          addingJob.insertAdjacentElement("beforebegin", deleteButton);
        }

        setDiv(addEditDiv);
      }
      else {
        // Job not found or error in retrieval
        message.textContent = "The jobs entry was not found.";
        showJobs();
      }
    } catch (err) {
      console.error(err);
      message.textContent = "A communication error has occurred.";
      showJobs();
    }

    enableInput(true);
  }
};

