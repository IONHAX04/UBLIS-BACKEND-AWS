export function staffDetailSend(id: number, password: string) {
  const mail = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Ublis Yoga</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #ff7f50; /* Coral color */
            padding: 20px;
            text-align: center;
            color: white;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
        }
        .footer {
            padding: 10px;
            text-align: center;
            font-size: 0.9em;
            color: #555555;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #ff7f50; /* Coral color */
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>Welcome to Ublis Yoga!</h1>
    </div>
    <div class="content">
        <p>Dear User,</p>
        <p>Congratulations on joining us!</p>
        <p>Your username is: <strong>${id}</strong></p>
        <p>Your password is: <strong>${password}</strong></p>
        <p>Please complete all the documentation and personal data updates on our website by logging in using your username and password.</p>
        <a href="https://yourwebsite.com/login" class="button">Login Here</a>
    </div>
    <div class="footer">
        <p>Thank you,</p>
        <p>The Ublis Yoga Team</p>
    </div>
</div>

</body>
</html>`;

  return mail;
}
