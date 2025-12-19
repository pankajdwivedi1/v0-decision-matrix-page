import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, nationality, message } = body

        // In a real application, you would use a service like Resend, Nodemailer, or SendGrid here.
        // Since I don't have API keys, I will log the data and return a success response.
        // Destination: pankaj86.dwivedi@gmail.com

        console.log("------------------- NEW CONTACT MESSAGE -------------------")
        console.log(`To: pankaj86.dwivedi@gmail.com`)
        console.log(`From: ${name} (${email})`)
        console.log(`Nationality: ${nationality}`)
        console.log(`Message: ${message}`)
        console.log("-----------------------------------------------------------")

        // You can implement the actual email sending logic here if you have a service provider.
        // Example with Resend:
        // await resend.emails.send({
        //   from: 'Contact <onboarding@resend.dev>',
        //   to: 'pankaj86.dwivedi@gmail.com',
        //   subject: `New Message from ${name} (${nationality})`,
        //   text: `Name: ${name}\nEmail: ${email}\nNationality: ${nationality}\nMessage: ${message}`,
        // });

        return NextResponse.json({ success: true, message: "Message received" })
    } catch (error) {
        console.error("Contact Form Error:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}
