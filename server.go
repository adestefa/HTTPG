package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type Data struct {
	Agent   string
	Date    time.Time
	Level   int
	Correct []interface{}
	Wrong   []interface{}
}

func GetLogTimestamp() string {
	currentTime := time.Now()
	return currentTime.Format("2006-01-02 15:04:05")
}

// Helper function to convert interface{} slices to JSON strings
func jsonify(data []interface{}) string {
	jsonData, _ := json.Marshal(data)
	return string(jsonData)
}

func main() {

	// DB CONN  -------------------------------
	// Open or create an SQLite database file
	//db, err := sql.Open("sqlite3", "mydatabase.db")
	//if err != nil {
	//		log.Fatal(err)
	//}
	//	defer db.Close()

	// INSERT RECORD ---------------------------
	// Create a table to store the JSON data
	//	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS jsonData (
	//       Agent TEXT,
	//       Date TEXT,
	//       Level INTEGER,
	//       Correct TEXT,
	//       Wrong TEXT
	//   )`)
	//	if err != nil {
	//		log.Fatal(err)
	//	}

	// START SERVER ---------------------------
	// let the console know we are up..
	fmt.Println("Server running on http://localhost/")

	// Create a file server to serve static files (e.g., images)
	fs := http.FileServer(http.Dir("static"))

	// Serve static files at a specific URL path (e.g., /static/)
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.Handle("/", fs)

	/* http.HandleFunc("/save-game", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Only POST requests are allowed", http.StatusMethodNotAllowed)
			return
		}

		var inputData Data

		decoder := json.NewDecoder(r.Body)
		if err := decoder.Decode(&inputData); err != nil {
			http.Error(w, "Failed to decode JSON", http.StatusBadRequest)
			return
		}

		// Store the POST data in the database
		insertStmt, err := db.Prepare("INSERT INTO jsonData (Agent, Date, Level, Correct, Wrong) VALUES (?, ?, ?, ?, ?)")
		if err != nil {
			http.Error(w, "Failed to prepare database statement", http.StatusInternalServerError)
			return
		}
		defer insertStmt.Close()

		_, err = insertStmt.Exec(inputData.Agent, inputData.Date.String(), inputData.Level, jsonify(inputData.Correct), jsonify(inputData.Wrong))
		if err != nil {
			http.Error(w, "Failed to insert data into the database", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("JSON data received and stored in the database"))
	})

	http.HandleFunc("/report", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Only GET requests are allowed", http.StatusMethodNotAllowed)
			return
		}

		// Retrieve the saved JSON data from the database
		rows, err := db.Query("SELECT * FROM jsonData")
		if err != nil {
			http.Error(w, "Failed to query the database", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var records []Data
		for rows.Next() {
			var record Data
			var dateStr string
			if err := rows.Scan(&record.Agent, &dateStr, &record.Level, &record.Correct, &record.Wrong); err != nil {
				http.Error(w, "Failed to scan database rows", http.StatusInternalServerError)
				return
			}
			record.Date, _ = time.Parse(time.RFC3339, dateStr)
			records = append(records, record)
		}

		// Encode the retrieved records as JSON and send them in the response
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(records); err != nil {
			http.Error(w, "Failed to encode JSON response", http.StatusInternalServerError)
			return
		}
	}) */

	log.Fatal(http.ListenAndServe(":3000", nil))

}
