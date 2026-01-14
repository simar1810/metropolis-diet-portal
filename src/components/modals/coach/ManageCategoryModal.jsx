"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { sendData } from "@/lib/api";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export function ManageCategoryModal({ children, category, onSave }) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		assignmentControlType: "automatic",
		criteria: {
			minFirstLine: 0,
			minClusterSize: 0,
			requiresClubMembership: false,
			minClubMemberships: 0,
			requiresVolumePoints: false,
			minVolumePoints: 0,
			isPermanent: false,
		},
		permissions: {
			clubAccess: "none",
			categoryCreationAccess: "none",
			downlineManagementAccess: "view",
		},
	});

	useEffect(() => {
		if (category && open) {
			setFormData({
				name: category.name || "",
				description: category.description || "",
				assignmentControlType: category.assignmentControlType || "automatic",
				criteria: category.criteria || {
					minFirstLine: 0,
					minClusterSize: 0,
					requiresClubMembership: false,
					minClubMemberships: 0,
					requiresVolumePoints: false,
					minVolumePoints: 0,
					isPermanent: false,
				},
				permissions: category.permissions || {
					clubAccess: "none",
					categoryCreationAccess: "none",
					downlineManagementAccess: "view",
				},
			});
		} else if (!category && open) {
			// Reset to default when opening for creation
			setFormData({
				name: "",
				description: "",
				assignmentControlType: "automatic",
				criteria: {
					minFirstLine: 0,
					minClusterSize: 0,
					requiresClubMembership: false,
					minClubMemberships: 0,
					requiresVolumePoints: false,
					minVolumePoints: 0,
					isPermanent: false,
				},
				permissions: {
					clubAccess: "none",
					categoryCreationAccess: "none",
					downlineManagementAccess: "view",
				},
			});
		}
		setErrors({}); // Clear errors when modal opens or category changes
	}, [category, open]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleCriteriaChange = (name, value) => {
		setFormData((prev) => ({
			...prev,
			criteria: { ...prev.criteria, [name]: value },
		}));
	};

	const handlePermissionChange = (name, value) => {
		setFormData((prev) => ({
			...prev,
			permissions: { ...prev.permissions, [name]: value },
		}));
	};

	const validateForm = () => {
		const newErrors = {};
		if (formData.assignmentControlType === "automatic") {
			if (
				!formData.criteria.requiresClubMembership &&
				!formData.criteria.requiresVolumePoints
			) {
				newErrors.rules =
					"For automatic assignment, you must enable at least one rule (Club Membership or Volume Points).";
			}
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) {
			return;
		}
		setLoading(true);
		try {
			const apiPath = category
				? `app/coach-categories/${category._id}`
				: "app/coach-categories";
			const method = category ? "PUT" : "POST";
			const response = await sendData(apiPath, formData, method);
			if (response.status_code !== 200 && response.status_code !== 201) {
				throw new Error(
					response.message ||
						`Failed to ${category ? "update" : "create"} category.`
				);
			}
			toast.success(
				`Category ${category ? "updated" : "created"} successfully.`
			);
			onSave();
			setOpen(false);
		} catch (err) {
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Style for checked radio buttons
	const checkedRadioStyle =
		"data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground";

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[650px] bg-white dark:bg-slate-900">
				<DialogHeader>
					<DialogTitle className="text-2xl">
						{category ? "Edit" : "Create"} Coach Category
					</DialogTitle>
					<DialogDescription>
						Define the rules, criteria, and permissions for this coach category.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className="space-y-6 max-h-[70vh] overflow-y-auto pr-4"
				>
					<div className="space-y-2">
						<Label htmlFor="name" className="text-base">
							Category Name
						</Label>
						<Input
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							placeholder="e.g., Club Leader, Gold Member"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description" className="text-base">
							Description
						</Label>
						<Textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							required
							placeholder="A brief summary of what this category represents."
						/>
					</div>

					<Accordion
						type="multiple"
						defaultValue={["item-1", "item-2"]}
						className="w-full"
					>
						<AccordionItem value="item-1">
							<AccordionTrigger className="text-lg font-semibold">
								How to Become
							</AccordionTrigger>
							<AccordionContent className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md space-y-4">
								<RadioGroup
									value={formData.assignmentControlType}
									onValueChange={(value) =>
										setFormData((prev) => ({
											...prev,
											assignmentControlType: value,
										}))
									}
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem
											value="manual"
											id="manual"
											className={checkedRadioStyle}
										/>
										<Label htmlFor="manual">
											Manual Assignment (Admin selects role)
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem
											value="automatic"
											id="automatic"
											className={checkedRadioStyle}
										/>
										<Label htmlFor="automatic">
											Automatic (Based on Rules)
										</Label>
									</div>
								</RadioGroup>

								{formData.assignmentControlType === "automatic" && (
									<div className="space-y-4 border-t pt-4">
										<div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-700">
											<Label
												htmlFor="requiresClubMembership"
												className="font-medium"
											>
												Requires Club Membership?
											</Label>
											<Switch
												id="requiresClubMembership"
												checked={formData.criteria.requiresClubMembership}
												onCheckedChange={(checked) =>
													handleCriteriaChange(
														"requiresClubMembership",
														checked
													)
												}
											/>
										</div>
										{formData.criteria.requiresClubMembership && (
											<div className="pl-4">
												<Label>Minimum Club Memberships</Label>
												<Input
													type="number"
													name="minClubMemberships"
													value={formData.criteria.minClubMemberships}
													onChange={(e) =>
														handleCriteriaChange(
															"minClubMemberships",
															e.target.value
														)
													}
												/>
											</div>
										)}

										<div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-700">
											<Label
												htmlFor="requiresVolumePoints"
												className="font-medium"
											>
												Requires Volume Points?
											</Label>
											<Switch
												id="requiresVolumePoints"
												checked={formData.criteria.requiresVolumePoints}
												onCheckedChange={(checked) =>
													handleCriteriaChange("requiresVolumePoints", checked)
												}
											/>
										</div>
										{formData.criteria.requiresVolumePoints && (
											<div className="pl-4">
												<Label>Minimum Volume Points</Label>
												<Input
													type="number"
													name="minVolumePoints"
													value={formData.criteria.minVolumePoints}
													onChange={(e) =>
														handleCriteriaChange(
															"minVolumePoints",
															e.target.value
														)
													}
												/>
											</div>
										)}

										{errors.rules && (
											<p className="text-sm text-red-500 flex items-center gap-2 mt-2">
												<AlertCircle className="h-4 w-4" />
												{errors.rules}
											</p>
										)}
									</div>
								)}
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-2">
							<AccordionTrigger className="text-lg font-semibold">
								Access Permissions
							</AccordionTrigger>
							<AccordionContent className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md space-y-6">
								<div>
									<Label className="font-medium">Club Access</Label>
									<RadioGroup
										value={formData.permissions.clubAccess}
										onValueChange={(value) =>
											handlePermissionChange("clubAccess", value)
										}
										className="flex space-x-4 mt-2"
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value="view"
												id="club-view"
												className={checkedRadioStyle}
											/>
											<Label htmlFor="club-view">View</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value="edit"
												id="club-edit"
												className={checkedRadioStyle}
											/>
											<Label htmlFor="club-edit">Edit</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value="none"
												id="club-none"
												className={checkedRadioStyle}
											/>
											<Label htmlFor="club-none">None</Label>
										</div>
									</RadioGroup>
								</div>
								<div>
									<Label className="font-medium">Category Creation</Label>
									<RadioGroup
										value={formData.permissions.categoryCreationAccess}
										onValueChange={(value) =>
											handlePermissionChange("categoryCreationAccess", value)
										}
										className="flex space-x-4 mt-2"
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value="view"
												id="cat-view"
												className={checkedRadioStyle}
											/>
											<Label htmlFor="cat-view">View</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value="edit"
												id="cat-edit"
												className={checkedRadioStyle}
											/>
											<Label htmlFor="cat-edit">Edit</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value="none"
												id="cat-none"
												className={checkedRadioStyle}
											/>
											<Label htmlFor="cat-none">None</Label>
										</div>
									</RadioGroup>
								</div>
								<div>
									<Label className="font-medium">Downline Management</Label>
									<RadioGroup
										value={formData.permissions.downlineManagementAccess}
										onValueChange={(value) =>
											handlePermissionChange("downlineManagementAccess", value)
										}
										className="flex space-x-4 mt-2"
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value="view"
												id="down-view"
												className={checkedRadioStyle}
											/>
											<Label htmlFor="down-view">View</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value="edit"
												id="down-edit"
												className={checkedRadioStyle}
											/>
											<Label htmlFor="down-edit">Edit</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value="none"
												id="down-none"
												className={checkedRadioStyle}
											/>
											<Label htmlFor="down-none">None</Label>
										</div>
									</RadioGroup>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</form>
				<DialogFooter className="mt-6">
					<Button variant="ghost" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={loading}>
						{loading ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
