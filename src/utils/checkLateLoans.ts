import Loan from '../models/Loan';

export async function checkLateLoans(): Promise<void> {
  const result = await Loan.updateMany(
    { status: 'ACTIVE', dueDate: { $lt: new Date() } },
    { $set: { status: 'LATE' } }
  );

  if (result.modifiedCount > 0) {
    console.log(`Marked ${result.modifiedCount} loan(s) as LATE`);
  }
}
