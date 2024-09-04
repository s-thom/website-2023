import { type DevToolbarApp } from "astro";

const NOTION_SVG =
  '<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z" fill="currentColor"/></svg>';

const notionCacheDevTools: DevToolbarApp = {
  id: "sthom-notion-cache-dev-tools",
  name: "Notion Cache",
  icon: NOTION_SVG,
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
    actionsParagraph.appendChild(reloadButton);

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
