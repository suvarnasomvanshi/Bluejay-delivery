import fs from "fs/promises";
import XLSX from "xlsx";


const inputFile = "Assignment_Timecard.xlsx";
const outputFile = "output.txt";


const readExcelFile = async (Assignment_Timecard) => {
  const workbook = XLSX.readFile(Assignment_Timecard);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
};



// Function to analyze the data and find employees meeting the specified conditions
const analyzeEmployeeData = async(data) => {
  

  const employees = {};

  const results = {
    workFor7consecutiveDays: [],
    lessThan10HoursShift: [],
    workFormoreThan14Hours: [],
  };

  // Iterate through the data
  data.forEach((entry) => {
    const employeeName = entry["Employee Name"];
    if (!employees[employeeName]) {
      // Initialize employee data if not exist
      employees[employeeName] = {
        name: employeeName,
        position: entry["Position ID"],
        shifts: [],
      };
    }

    // Add the current shift to the employee's data
    employees[employeeName].shifts.push({
      timeIn: entry["Time"],
      timeOut: entry["Time Out"],
    });
  });

  // Iterate through employee data to identify conditions
  for (const employeeName in employees) {
    const employee = employees[employeeName];
    const shifts = employee.shifts;

    //who has worked for 7 consecutive days
    if (shifts.length >= 7) {
      let consecutiveDays = 1;
      for (let i = 1; i < shifts.length; i++) {
        if (shifts[i].timeIn - shifts[i - 1].timeOut <= 1) {
          consecutiveDays++;
          if (consecutiveDays === 7) {
            results.workFor7consecutiveDays.push(
              `${employee.name} (Position: ${employee.position}) has worked for 7 consecutive days.`
            );
            break;
          }
        } else {
          consecutiveDays = 1;
        }
      }
    }

    //who have less than 10 hours of time between shifts but greater than 1 hour
    for (let i = 1; i < shifts.length; i++) {
      const timeBetweenShifts = shifts[i].timeIn - shifts[i - 1].timeOut;
      if (timeBetweenShifts > 1 && timeBetweenShifts < 10) {
        results.lessThan10HoursShift.push(
          `${employee.name} (Position: ${employee.position}) has less than 10 hours between shifts, but more than 1 hour.`
        );
        break;
      }
    }

    //Who has worked for more than 14 hours in a single shift
    shifts.forEach((shift) => {
      if (shift.timeOut - shift.timeIn > 14) {
        results.workFormoreThan14Hours.push(
          `${employee.name} (Position: ${employee.position}) has worked for more than 14 hours in a single shift.`
        );
      }
      else{
        results.workFormoreThan14Hours.push(
            `no has worked for more than 14 hours in a single shift.`
          );
      }
    });
  }

  //console.log(results)

  const resultsString = JSON.stringify(results);

  try {
     await fs.writeFile(outputFile, resultsString);
    console.log("Results have been written to output.txt");
  } catch (error) {
    console.error("Error writing to file:", error);
  }
};

// Main function to read the file, analyze the data, and print results
const main = async () => {
  try {
    const inputFile = "Assignment_Timecard.xlsx";
    const data = await readExcelFile(inputFile);
    //console.log(data)
    analyzeEmployeeData(data);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();




