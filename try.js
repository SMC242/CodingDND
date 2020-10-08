const { exec } = require("child_process");
const column_end = (row) => row.indexOf("  "); // get the end of the name column
const parse_row = (row) => row.slice(0, column_end(row));

async function win_processes() {
  var processes = [];
  exec("tasklist", (err, stdout) => {
    const process_rows = stdout.split("\r\n");
    let row;
    let parsed_row;
    // there's 3 rows of table formatting so start from i = 3
    for (let i = 3; i < process_rows.length; i += 3) {
      row = process_rows[i];
      parsed_row = parse_row(row);
      processes.push(parsed_row);
    }
  });
  await new Promise((r) => setTimeout(r, 1000)); // block until tasklist finishes
  return processes;
}

async function linux_processes() {}
const process_getter = process.platform === "win32" ? win_processes : "ps -aux"; // support linux
console.log(process_getter());
