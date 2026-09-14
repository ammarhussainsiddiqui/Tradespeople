"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"
import { generateToken, isValidUKPostalCode } from '../../utils/functions'
import { toast } from "react-toastify";
export default function EditDialog({ job, onUpdate }) {

  const [formData, setFormData] = useState({
    headline: job.job.headline,
    postcode: job.job.postcode,
    description: job.job.description,
    jobInvolvement: job.job["What does your job involve?"],
  });

  const [options, setOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!job?.serviceId) return; // Ensure job.serviceId exists

      try {
        const token = await generateToken();
        const response = await fetch(`/api/service-questions?serviceId=${job.serviceId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-cache",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        // Extract first question's answers and map them to an object structure
        const firstQuestion = result.questions?.[0];
        const formattedOptions = firstQuestion?.answers?.map((answer, index) => ({
          id: index,
          name: answer,
        })) || [];

        setOptions(formattedOptions);
      } catch (error) {
      }
    };

    fetchOptions();
  }, [job?.serviceId]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "headline" && value.length > 50) return;

    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "postcode" ? value.toUpperCase() : value, // Convert only postcode to uppercase
    }));
  };


  const handleSubmit = async (e) => {
    setIsLoading(true)
    e.preventDefault();

    // Check for validation errors before submitting
    const newErrors = {};

    if (!formData.headline || formData.headline.length > 50) {
      newErrors.headline = "Title cannot exceed 50 characters.";
    }
    if (!isValidUKPostalCode(formData.postcode)) {
      newErrors.postcode = "Invalid UK postcode format.";
    }
    if (formData.description.length > 250) {
      newErrors.description = "Description cannot exceed 250 characters.";
    }
    if (formData.description.length == 0) {
      newErrors.description = "Description cannot be empty.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Prevent form submission if validation fails
    }

    try {
      const response = await fetch(`/api/edit/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...job,
          job: {
            ...job.job,
            headline: formData.headline,
            postcode: formData.postcode,
            description: formData.description,
            "What does your job involve?": formData.jobInvolvement,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to update job");
      toast.success("Job Details Updated", {
        position: "top-center",
      });
      const updatedJob = await response.json();
      onUpdate(updatedJob);
    } catch (error) {
      toast.error(error.message || "Error updating job details.", {
        position: "top-center",
      });
    } finally {
      setIsLoading(false)
    }
    setInterval(() => {
      window.location.reload();
    }, 2000)
  };
  const jobOptions = options.map((option) => ({
    value: option.name,
    label: option.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 ">
      <div>
        <Label htmlFor="headline">Headline</Label>
        <Input id="headline" name="headline" value={formData.headline} onChange={handleInputChange}
          className={errors.headline ? "border-destructive mt-2" : " mt-2"}
        />
        <p className="text-muted-foreground text-sm mt-2">{formData.headline.length}/50</p>
        {errors.headline && <p className="text-destructive text-sm">{errors.headline}</p>}
      </div>

      {/* Postcode Validation */}
      <div>
        <Label htmlFor="postcode">Postcode</Label>
        <Input
          id="postcode"
          name="postcode"
          value={formData.postcode}
          onChange={handleInputChange}
          className={errors.postcode ? "border-destructive mt-2" : " mt-2"}
        />
        {errors.postcode && <p className="text-destructive text-sm">{errors.postcode}</p>}
      </div>

      {/* Description Validation */}
      <div>
        <Label htmlFor="description" >Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          maxLength={250}
          className={errors.description ? "border-destructive mt-2" : " mt-2"}
        />
        <p className="text-muted-foreground text-sm mt-2">{formData.description.length}/250</p>
        {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
      </div>

      <Button className="bg-accent px-6 hover:bg-primary hover:text-ink-inverse text-accent-foreground" type="submit">
        {isLoading ? 'Loading...' : 'Save Changes'}
      </Button>
    </form>
  );
}



