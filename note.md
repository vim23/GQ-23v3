Mar 7 ( 1.30 Hours)

- Implementing the logout functionality
- Add sub text under the logo on each login and register page

TODO

- [x] sign out
- [x] Host it on Vercel
- [x] get the images going to the correct S3 buckets
         use: report-images, update images and avatar buckets
- [x] get the camera frame to stay small - not expand to full screen
- [x] Update text in w3api popup
- [ ] get the UI issues with buttons and slider fixed

- [ ] see if you can fix the bug when a user clicks on View Map in the Home screen report the first time, the points do not load on the map. the second time you go back to the Home screen, open the report again and click on View Map again, then the points show.

- [ ] get the update report button on Home screen reports and in Map screen reports to work
- [ ] I think that currently the code for the update report in the Home screen is more complete than the code for the update report in the Map screen. Getting update report to work from the -
- [ ] reports in the Map screen is the priority.
        the code for the update screens is there... the update.uprepid is linked to report.repid
        repid => uprepid is a 1:M relationship
        3 updates is the maximum. when a 4th update is attempted, the modal should tell the user        that the maximum number of updates on this report has been reached. Please open a new report. Add an Ok button that takes the user to the Submit a report screen.

18:35
