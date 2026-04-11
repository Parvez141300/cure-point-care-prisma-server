
const getAllAppointmentFromDB = async () => {};

const getMyAppointmentsFromDB = async (id: string) => {};

const getSingleAppointmentFromDB = async (id: string) => {};

const bookAppointmentInDB = async (appointmentData: any) => {};

const changeAppointmentStatusInDB = async (id: string, status: string) => {};


export const AppointmentService = {
  getAllAppointmentFromDB,
  getMyAppointmentsFromDB,
  getSingleAppointmentFromDB,
  bookAppointmentInDB,
  changeAppointmentStatusInDB,
};
