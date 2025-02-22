var accumulatedCveDoughnut = document.getElementById('accumulatedCveDoughnut').getContext('2d');

var nxpie = document.getElementById('nxpie').getContext('2d');
var piepie = document.getElementById('piepie').getContext('2d');
var relropie = document.getElementById('relropie').getContext('2d');
var canarypie = document.getElementById('canarypie').getContext('2d');
var strippedpie = document.getElementById('strippedpie').getContext('2d');

let report_id = window.location.pathname.split("/").pop();
let entropy_url = "/emba_logs/REPORT_ID_REPLACE/html-report/style/firmware_entropy.png".replace(/REPORT_ID_REPLACE/,report_id);
document.getElementById("entropy").src = entropy_url;

/**
 * get the id of the current report -> we use this for the buttons and the entropy graph
 */
function get_report_url() {
  let report_id = window.location.pathname.split("/").pop();
  let report_url = "/emba_logs/REPORT_ID_REPLACE/html-report/index.html".replace(/REPORT_ID_REPLACE/,report_id);
  window.location.href = report_url;
  console.log(report_url);
}

function get_dl_report_url() {
  let report_id = window.location.pathname.split("/").pop();
  let report_url = "/download_zipped/REPORT_ID_REPLACE".replace(/REPORT_ID_REPLACE/,report_id);
  window.location.href = report_url;
  console.log(report_url);
}

/**
 * Generates Reports after you complete receiving the data for Individual Fimware
 */
get_individual_report().then(function (returnData) {

    let cvedoughnutChart = new Chart(accumulatedCveDoughnut, {
        type: 'doughnut',
        data: {
            labels: [
                'CVE-High',
                'CVE-Low',
                'CVE-Medium'
            ],
            datasets: [{
                label: 'CVE DATA',
                data: [returnData.cve_high, returnData.cve_low, returnData.cve_medium],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'CVE Data',
                    position: 'top',
                    color: 666,
                    padding: {
                        top: 15,
                        bottom: 10
                    },
                    font: {
                        size: 24
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        fontColor: '#000'
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        bottom: 0,
                        top: 0
                    }
                },
                tooltips: {
                    enabled: true
                }
            }
        }
    });

    make_chart(relropie, 'Binaries without RELRO', 'Binaries with RELRO',
        '#493791', '#291771', returnData.bins_checked, returnData.relro, 'RELRO')
    make_chart(nxpie, 'Binaries without NX', 'Binaries with NX',
        '#1b1534', '#000014', returnData.bins_checked, returnData.nx, 'NX')
    make_chart(piepie, 'Binaries without PIE', 'Binaries with PIE',
        '#7b919d', '#5b717d', returnData.bins_checked, returnData.pie, 'PIE')
    make_chart(canarypie, 'Binaries without CANARY', 'Binaries with CANARY',
        '#525d63', '#323d43', returnData.bins_checked, returnData.canary, 'CANARY')
    make_chart(strippedpie, 'Stripped binaries', 'Unstripped binaries',
        '#009999', '#005050', returnData.bins_checked, returnData.stripped, 'Stripped')

    let data_to_display = {
        "Firmware name": returnData.name.replace(/\d\//,""),
        "Firmware ID": returnData.name.replace(/\/.*$/,""),
        "Start date": returnData.start_date.replace('T', ' - '),
        "End date": returnData.end_date.replace('T', ' - '),
        "Scan time": "TODO",
        "Vendor": returnData.vendor,
        "Version": returnData.version,
        "Notes": returnData.notes,
        "Operating sytem detected": returnData.os_verified,
        "Architecture detected": returnData.architecture_verified,
        "Entropy value": returnData.entropy_value,
        "Path to logs": returnData.path_to_logs.replace(/\/app\/emba/,""),
        "EMBA command": returnData.emba_command,
        "Files detected": returnData.files,
        "Directories detected": returnData.directories,
        "Certificates detected": returnData.certificates,
        "Outdated certificates detected": returnData.certificates_outdated,
        "Shell scripts detected": returnData.shell_scripts,
        "Shell script issues": returnData.shell_script_vulns,
        "Binaries checked": returnData.bins_checked,
        "Versions identified": returnData.versions_identified,
        "Exploits identified": returnData.exploits,
        "Metasploit modules": returnData.metasploit_modules,
        "High CVE": returnData.cve_high,
        "Medium CVE": returnData.cve_medium,
        "Low CVE": returnData.cve_low,
        "NX disabled binaries": returnData.nx,
        "RELRO disabled binaries": returnData.relro,
        "PIE disabled binaries": returnData.pie,
        "Stack canaries disabled binaries": returnData.canary,
        "Stripped binaries": returnData.stripped,
    }

    for (const [key, value] of Object.entries(returnData.strcpy_bin)) {
        data_to_display["STRCPY binary: " + key] = value
    }

    const table = document.getElementById("detail_body");
    for (const [key, value] of Object.entries(data_to_display)) {
        let row = table.insertRow();
        let date = row.insertCell(0);
        date.innerHTML = key
        let name = row.insertCell(1);
        name.innerHTML = value;
    }
});

/**
 * Gets data to generate Reports for Individual Firmware
 * @returns data of the Nalysed Individual firmware
 */
function get_individual_report() {
    let report_index = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
    let url = window.location.origin + "/get_individual_report/" + report_index;

    return $.getJSON(url).then(function (data) {
        return data
    })
}

/**
 * Develops Chart
 * @param {*} html_chart Type of Chart
 * @param {*} label_1 Labels
 * @param {*} label_2 Labels
 * @param {*} color_1 Colors
 * @param {*} color_2 Colors
 * @param {*} data_cmp Data to be plotted
 * @param {*} data_strcpy
 * @param {*} title Title of The chart
 */
function make_chart(html_chart, label_1, label_2, color_1, color_2, data_cmp, data_strcpy, title) {
    let chart = new Chart(html_chart, {
        type: 'pie',
        data: {
            labels: [label_1, label_2],
            datasets: [{
                labels: [label_1, label_2],
                data: [data_strcpy, (data_cmp - data_strcpy)],
                backgroundColor: [color_1, color_2],
            }, ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    position: 'top',
                    color: 666,
                    padding: {
                        top: 15,
                        bottom: 10
                    },
                    font: {
                        size: 24
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        fontColor: '#000'
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        bottom: 0,
                        top: 0
                    }
                },
                tooltips: {
                    enabled: true
                }
            }
        }
    });
}
