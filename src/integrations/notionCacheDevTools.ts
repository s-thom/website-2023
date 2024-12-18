import { type DevToolbarApp } from "astro";

const notionCacheDevTools: DevToolbarApp = {
  init(canvas, eventTarget) {
    const container = document.createElement("astro-dev-toolbar-window");
    canvas.appendChild(container);

    const header = document.createElement("header");
    container.appendChild(header);
    const heading = document.createElement("h1");
    heading.textContent = "Notion Info";
    heading.style.margin = "0";
    header.appendChild(heading);

    const noNotion = document.createElement("section");
    container.appendChild(noNotion);
    const noNotionParagraph = document.createElement("p");
    noNotionParagraph.textContent =
      "This page doesn't appear to have any Notion content.";
    noNotion.appendChild(noNotionParagraph);

    const yesNotion = document.createElement("section");
    yesNotion.style.display = "none";
    container.appendChild(yesNotion);

    const idParagraph = document.createElement("p");
    yesNotion.appendChild(idParagraph);
    const idParagraphText = document.createTextNode("Notion page ID: ");
    idParagraph.appendChild(idParagraphText);
    const idParagraphId = document.createElement("span");
    idParagraphId.textContent = "Unknown";
    idParagraph.appendChild(idParagraphId);

    const actionsParagraph = document.createElement("p");
    actionsParagraph.style.display = "flex";
    actionsParagraph.style.gap = "0.5em";
    yesNotion.appendChild(actionsParagraph);

    const actionsLink = document.createElement("a");
    actionsLink.rel = "external noreferrer";
    actionsLink.href = "https://notion.so#Unknown";
    actionsLink.target = "_blank";
    actionsParagraph.appendChild(actionsLink);
    const actionsLinkButton = document.createElement(
      "astro-dev-toolbar-button",
    );
    actionsLinkButton.buttonStyle = "purple";
    actionsLinkButton.textContent = "Open in Notion";
    actionsLink.appendChild(actionsLinkButton);

    const reloadButton = document.createElement("astro-dev-toolbar-button");
    reloadButton.buttonStyle = "gray";
    reloadButton.textContent = "Reload Notion cache";
    reloadButton.addEventListener("click", () => {
      if (import.meta.hot) {
        import.meta.hot.send("sthom:notion-cache", {
          pageId: idParagraphId.textContent,
        });
      }
    });
    // TODO: re-add button when reloading is available in
    // actionsParagraph.appendChild(reloadButton);

    if (import.meta.hot) {
      import.meta.hot.on("sthom:reload", () => {
        window.location.reload();
      });
    }

    eventTarget.addEventListener("app-toggled", (event) => {
      if ((event as any).detail.state === true) {
        const pageIdElement = document.querySelector("#DEV-notion-page-id");
        if (!pageIdElement) {
          noNotion.style.display = "block";
          yesNotion.style.display = "none";
        } else {
          noNotion.style.display = "none";
          yesNotion.style.display = "block";

          const pageId = pageIdElement.textContent ?? "";

          idParagraphId.textContent = pageId;
          actionsLink.href = `https://notion.so/${pageId.replace(/-/g, "")}`;
        }
      }
    });
  },
};

export default notionCacheDevTools;
