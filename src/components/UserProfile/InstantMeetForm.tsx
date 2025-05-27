import React, { useState, useCallback } from "react";

interface InstantMeetFormProps {
  initialData: { title: string; description: string };
  onChange: (data: { title: string; description: string }) => void; 
}

const InstantMeetForm = React.memo(
  ({ initialData, onChange }: InstantMeetFormProps) => {
    const [formData, setFormData] = useState(initialData);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newData = {
          ...formData,
          [name]: value,
        };
        setFormData(newData);
        onChange(newData); 
      },
      [formData, onChange] 
    );

    return (
      <>
        <div className="px-1 font-medium">Title:</div>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Explain Governance"
          className="outline-none bg-[#D9D9D945] rounded-md px-2 py-1 text-sm w-full mt-1 mb-3"
          required
          key="form-title-input" 
        />

        <div className="px-1 font-medium">Description:</div>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Please share anything that will help prepare for our meeting."
          className="outline-none bg-[#D9D9D945] rounded-md px-2 py-1 text-sm w-full mt-1 mb-3 h-20 resize-none"
          required
          key="form-description-textarea" 
        />
      </>
    );
  }
);

InstantMeetForm.displayName = "InstantMeetForm"; 

export default InstantMeetForm;