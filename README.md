# lost-and-found-portal
A full-stack web application designed to help students and staff report lost items, search for found items, and reclaim belongings within the campus environment.

**Tech Stack**

**Backend:** Java (Eclipse IDE)
**API Layer:** Node.js + Express (VS Code)
**Frontend:** React.js (VS Code)
**Database:** MySQL
**Frontend Language:** JavaScript
**Version Control:** Git + GitHub

**System Overview**
The Lost & Found Portal allows users to:

Submit reports for lost items
Submit reports for found items
Search for items using filters
Contact the item owner/finder
Track item status (lost, found, claimed)

**Project Structure**
/backend-java       → Java backend logic (Eclipse)
/node-server        → Node.js API server (VS Code)
/frontend-react     → React user interface (VS Code)
/docs               → Documentation

Access Model (Prototype Explanation)

The Lost & Found Portal works like a public notice board:

    • Anyone may report a lost item

    • Anyone may report a found item

    • Anyone may view all items

During reporting, users must provide:

A contact name, and

A contact phone number,
which creates a natural layer of accountability.

Currently, the “Mark as claimed” action is open for demonstration purposes.
In a real deployment, only staff (e.g., Security Office or Dean’s Office) would have access to this action.

Future Enhancements

    • User authentication (Admin/Staff login)
      
    • Role-based access control
      
    • History logs for reported and claimed items

**Author**
**Muganzi Alexander** – Bugema University
GitHub: @Muganzi-Elwin
