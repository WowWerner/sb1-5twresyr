const handleSubmitRFF = async (data: Partial<RFFApplication>) => {
  try {
    if (!userId) {
      throw new Error('Please log in to submit RFF applications');
    }

    // Transform form data to match database schema
    const rffData = transformRFFData(data);

    // Submit RFF application
    const { error } = await supabase
      .from('rff_applications')
      .insert([{
        ...rffData,
        submitted_by: userId // Just pass the UUID string
      }]);

    if (error) throw error;
    alert('RFF application submitted successfully');
  } catch (error) {
    console.error('Error submitting RFF:', error);
    alert('Failed to submit RFF application. Please try again.');
  }
};