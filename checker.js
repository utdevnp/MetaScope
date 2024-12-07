async function checkSEO() {
    const url = document.getElementById('url-input').value;

    // Clear previous results
    document.getElementById('tag-list').innerHTML = '';
    document.getElementById('status').innerHTML = '';

    if (!url) {
        document.getElementById('status').textContent = ` Please enter a valid URL.`;
        return;
    }

    try {
        // Use a proxy server to bypass CORS restrictions (AllOrigins or your custom proxy)
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const targetUrl = encodeURIComponent(url);

        // Fetch the HTML content of the given URL through the proxy
        const response = await fetch(proxyUrl + targetUrl);
        if (!response.ok) throw new Error('Failed to fetch the URL');

        const data = await response.json();
        const html = data.contents; // HTML content of the fetched URL
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html'); // Parse HTML to DOM

        // Get all <meta> tags from the document
        const metaTags = doc.getElementsByTagName('meta');
        const tagList = document.getElementById('tag-list');
        let jsonResults = [];

        // Loop through the meta tags and create JSON objects
        Array.from(metaTags).forEach(tag => {
            const name = tag.getAttribute('name');
            const property = tag.getAttribute('property');
            const content = tag.getAttribute('content');

            // Create the base object for the meta tag
            let tagObject = {
                "Tag name": name || property || "Unknown",
                "Content": content || "No Content",
                "isMatch": content ? true : false,
                "IsFacebook": (property && property.includes('og:')) ? true : false,
                "IsTwitter": (name && name.includes('twitter')) ? true : false,
                "isGoogle": (name && name.includes('google')) ? true : false,
                "fullTag": tag.outerHTML
            };

            // Push the tag object to JSON results
            jsonResults.push(tagObject);

            // Create a tag item to display on the page
            const tagItem = document.createElement('div');
            tagItem.classList.add('card', 'mb-3');

            // Create tag name heading with icons
            const tagName = document.createElement('h5');
            tagName.classList.add('card-header', 'd-flex', 'justify-content-between');

             // Create a div for icons to be aligned on the right
             const iconDiv = document.createElement('div');
             iconDiv.classList.add('d-flex', 'align-items-center'); // Ensuring icons are aligned properly
 
            // Add icon if isMatch is Yes
            let iconHTML = "";
            if (tagObject["isMatch"]) {
                iconHTML = `<i class="bi bi-check-circle text-success ms-auto"></i> `;
            } else {
                iconHTML = `<i class="bi bi-dash-circle ms-auto"></i> `;
            }

            // Add Facebook icon if it's a Facebook tag
            if (tagObject["IsFacebook"]) {
                iconHTML += `<i class="bi bi-facebook text-primary ms-2"></i> `;
            }

            // Add Google icon if it's a Google tag
            if (tagObject["isGoogle"]) {
                iconHTML += `<i class="bi bi-google text-danger ms-2"></i> `;
            }

            // Add Twitter icon if it's a Twitter tag
            if (tagObject["IsTwitter"]) {
                iconHTML += `<i class="bi bi-twitter text-info ms-2"></i> `;
            }

            // Set the tag name with icons
            tagName.innerHTML = `${tagObject["Tag name"]} ${iconHTML}`;
            tagItem.appendChild(tagName);

            // Create description for other details
            const tagDescription = document.createElement('div');
            tagDescription.classList.add('card-body');
            tagDescription.innerHTML = `
                <pre>${tagObject["fullTag"].replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>  <!-- Display full tag using <pre> -->
            `;
            tagItem.appendChild(tagDescription);

            // Append the tag item to the list
            tagList.appendChild(tagItem);
        });

        // Display the overall status
        if (jsonResults.length > 0) {
            document.getElementById('status').textContent = `${jsonResults.length} meta tags found.`;
        } else {
            document.getElementById('status').textContent = 'No meta tags found.';
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = 'An error occurred while fetching the URL.';
    }
}

document.getElementById('checkBtn').addEventListener('click', checkSEO);