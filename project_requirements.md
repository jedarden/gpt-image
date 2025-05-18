# GPT-Image-1 UI

This is meant to be a web application that allows users to use natural language as well as uploaded pictures to describe a photo they want to create. 

## Design & Features

- Mimic the familiar ChatGPT layout. 
- The left side should feature past image creation sessions the user can return to and continue the conversation. (25% wide)
- The right side should feature the current image creation session along with the chat history, and previously submitted images. (75% wide)
- The generated images appear in the chat history. 
- Clicking on a generated image creates a modal showing the iamge in a higher resolution. 
- The modal allows the user to navigate back and forth the history of generated images. 
- Navigation of the image viewing modal should support keyboard arrow keys, clickable buttons for a mouse, and mobile gestures (swipe left/right)
- Below the chat history is the prompt input section. It should also allow the user to upload photos which in turn can be added to the context when prompting the model. 
- Images and chat history should be stored on the users' local storage. 
- This application is meant to be stateless. 
- The application should be flexible enough to be hosted at a subpath. 
- The application should expose only one port when being deployed as a docker container.
- API Keys should be securely kept server-side, and never exposed to the browser.
- Between the chat interface and the gpt-image-1 model should be the gpt-4.1-nano model. The purpose of this intermediate model is to configure the inputs to the gpt-image-1 model. Examples include orientation (portrait / landscape), quality, etc. 
- The image modal should allow users to add a mask to an image and that mask gets submitted to the gpt-image-1 model as a part of its context. 
---

## CI Security, Multi-Arch Build, and Deployment Requirements

- **CI Security:** The project uses GitHub Actions with OIDC authentication for secure registry access and Trivy for automated vulnerability scanning of Docker images. The Trivy database cache key includes the Trivy version and OS for reliable, up-to-date scanning.
- **Multi-Arch Build:** Docker images are built and published for both `linux/amd64` and `linux/arm64` using Docker Buildx and QEMU, ensuring compatibility with a wide range of deployment targets.
- **Deployment:** Production deployment is via a single combined Docker image, running in `NODE_ENV=production` mode, exposing only one port. Static file path validation is enforced in the backend to prevent directory traversal attacks. Environment variables must be securely managed in all environments.

---