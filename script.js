document.addEventListener('DOMContentLoaded', function() {
  // Thay bằng các link CSV publish từ Sheets của bạn
  const csvUrls = {
    packages: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVY8H9-kxm9ywjaJNbZibgqud97ulwH8V0Q1K3o2ddEihkhJmb5ThXxjJDShJZaeTLQAwOumdB5X1b/pub?gid=1808798930&single=true&output=csv',
    northernHotels: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVY8H9-kxm9ywjaJNbZibgqud97ulwH8V0Q1K3o2ddEihkhJmb5ThXxjJDShJZaeTLQAwOumdB5X1b/pub?gid=943202508&single=true&output=csv',
    centralHotels: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVY8H9-kxm9ywjaJNbZibgqud97ulwH8V0Q1K3o2ddEihkhJmb5ThXxjJDShJZaeTLQAwOumdB5X1b/pub?gid=1545924102&single=true&output=csv',
    southernHotels: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVY8H9-kxm9ywjaJNbZibgqud97ulwH8V0Q1K3o2ddEihkhJmb5ThXxjJDShJZaeTLQAwOumdB5X1b/pub?gid=1159680108&single=true&output=csv',
    halongCruise: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVY8H9-kxm9ywjaJNbZibgqud97ulwH8V0Q1K3o2ddEihkhJmb5ThXxjJDShJZaeTLQAwOumdB5X1b/pub?gid=315991677&single=true&output=csv',
    restaurants: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVY8H9-kxm9ywjaJNbZibgqud97ulwH8V0Q1K3o2ddEihkhJmb5ThXxjJDShJZaeTLQAwOumdB5X1b/pub?gid=116299310&single=true&output=csv',
    contact: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVY8H9-kxm9ywjaJNbZibgqud97ulwH8V0Q1K3o2ddEihkhJmb5ThXxjJDShJZaeTLQAwOumdB5X1b/pub?gid=1650609520&single=true&output=csv'
  };

  // Load data cho từng tab
  Object.keys(csvUrls).forEach(key => {
    fetch(csvUrls[key])
      .then(response => response.text())
      .then(csvText => {
        const data = parseCSV(csvText);
        const tabId = key.replace(/([A-Z])/g, '-$1').toLowerCase(); // e.g., northernHotels -> northern-hotels
        const content = (key === 'packages') ? generateAccordion(data) : generateTable(data);
        document.getElementById(tabId).innerHTML = content;
      })
      .catch(error => console.error('Error loading CSV:', error));
  });
});

// Parse CSV thành array of arrays
function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/);
  return lines.map(line => line.split(',').map(cell => cell.trim()));
}

// Generate table HTML với hyperlinks (nếu cell là URL)
function generateTable(data) {
  let html = '<table><thead><tr>';
  if (data.length > 0) {
    data[0].forEach(header => {
      html += `<th>${header || ''}</th>`;
    });
    html += '</tr></thead><tbody>';
    for (let i = 1; i < data.length; i++) {
      html += '<tr>';
      data[i].forEach(cell => {
        let value = cell || '';
        if (value.startsWith('http')) {
          value = `<a href="${value}" target="_blank">View Details</a>`;
        }
        html += `<td>${value}</td>`;
      });
      html += '</tr>';
    }
    html += '</tbody></table>';
  }
  return html;
}

// Generate accordion cho Packages (detect sections dựa trên cell đầu tiên không rỗng)
function generateAccordion(data) {
  let html = '<div class="accordion" id="packagesAccordion">';
  let currentSection = '';
  let sectionIndex = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[0].trim() !== '') { // Section header ở cột đầu
      if (currentSection) {
        html += '</tbody></table></div></div></div>';
      }
      currentSection = row[0];
      html += `
        <div class="card">
          <div class="card-header" id="heading${sectionIndex}">
            <h2 class="mb-0">
              <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapse${sectionIndex}">
                ${currentSection}
              </button>
            </h2>
          </div>
          <div id="collapse${sectionIndex}" class="collapse" data-parent="#packagesAccordion">
            <div class="card-body">
              <table><tbody>`;
      sectionIndex++;
    } else if (currentSection) {
      html += '<tr>';
      row.forEach(cell => {
        let value = cell || '';
        if (value.startsWith('http')) {
          value = `<a href="${value}" target="_blank">View Details</a>`;
        }
        html += `<td>${value}</td>`;
      });
      html += '</tr>';
    }
  }
  if (currentSection) {
    html += '</tbody></table></div></div></div>';
  }
  html += '</div>';
  return html;
}
