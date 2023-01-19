interface MainInput {
  receiver: string;
  subjectPurpose: string;
  message: string;
  messageTitle: string;
}

export const sendEmail = async ({
  receiver,
  subjectPurpose,
  message,
  messageTitle,
}: MainInput) => {
  try {
    const response = await fetch('/api/mail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiver,
        subjectPurpose,
        message,
        messageTitle,
      }),
    });
    const data = await response.json();

    return data.result;
  } catch (error: any) {
    console.log('Error sending email', error);
    return error.message;
  }
};
