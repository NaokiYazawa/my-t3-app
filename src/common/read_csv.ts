export const readCSV = async (file: File): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const csvData = reader.result as string;
      const data = csvData
        .split("\n")
        .map((row) => row.split(",").map((cell) => cell.trim()));
      resolve(data);
    };
    reader.onerror = () => {
      reader.abort();
      reject(new Error("Error reading the CSV file."));
    };
    reader.readAsText(file, "UTF-8");
  });
};
