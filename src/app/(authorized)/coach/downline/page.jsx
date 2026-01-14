"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { nameInitials } from "@/lib/formatter";
import { useState } from "react";
import FormControl from "@/components/FormControl";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { sendData, fetchData } from "@/lib/api";
import { toast } from "sonner";
import { useAppSelector } from "@/providers/global/hooks";
import ContentError from "@/components/common/ContentError";
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import {
	retrieveClientList,
	retrieveDownlineCoaches,
	retrieveDownlineRequests,
} from "@/lib/fetchers/app";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TreeVisualizer from "@/components/pages/coach/downline/Visualizer";
import HierarchicalCoachTable from "@/components/pages/coach/downline/HierarchicalCoachTable";
import { PlusCircle, Edit, Trash2, Eye, ChevronDown } from "lucide-react";
import { ManageCategoryModal } from "@/components/modals/coach/ManageCategoryModal";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTabsContentNavigation } from "@/hooks/useTabsContentNavigation";
import { SyncedCoachClientDetails } from "@/components/modals/coach/SyncedCoachesModal";
import { cn } from "@/lib/utils";

const categoriesFetcher = () =>
	fetchData("app/coach-categories").then((res) => {
		if (res.status_code !== 200) throw new Error(res.message);
		return res.data;
	});

export default function Page() {
	const { tabChange, selectedTab } = useTabsContentNavigation(
		"list",
		["list", "visualizer", "manageCategories", "clients"]
	);

	const { data: coachData } = useAppSelector((state) => state.coach);
	const { downline = {}, features, clubType } = coachData;

	const {
		data: categories,
		error: categoriesError,
		isLoading: categoriesLoading,
		mutate: mutateCategories,
	} = useSWR("coach-categories", categoriesFetcher);

	const handleDeleteCategory = async (setLoading, closeBtnRef, categoryId) => {
		setLoading(true);
		try {
			const response = await sendData(
				`app/coach-categories/${categoryId}`,
				{},
				"DELETE"
			);
			if (response.status_code !== 200) throw new Error(response.message);
			toast.success("Category deleted successfully.");
			mutateCategories();
			closeBtnRef.current.click();
		} catch (err) {
			toast.error(err.message || "Failed to delete category.");
		} finally {
			setLoading(false);
		}
	};

	if (!features?.includes(5) && ["Club Leader", "Club Leader Jr", "Club Captain"].includes(clubType)) {
		return <ContentError title="This feature isn't enabled for you" />;
	}

	if (!["requested", "in-downline"].includes(downline?.status)) {
		return (
			<div className="content-height-screen content-container flex items-center justify-center">
				<StartDownline />
			</div>
		);
	}

	const initialNodeData = {
		id: coachData._id,
		label: nameInitials(coachData.name),
		categoryName: coachData.coachCategory?.name || "Uncategorized",
		title: `
            <div style="padding: 5px; color: #333;">
                <p style="margin: 0;"><b>Name:</b> ${coachData.name}</p>
                <p style="margin: 0;"><b>Category:</b> ${coachData.coachCategory?.name || "Uncategorized"
			}</p>
                <p style="margin: 0;"><b>ID:</b> ${coachData.coachId}</p>
            </div>
        `,
	};

	return (
		<div className="content-container content-height-screen">
			{downline.status === "requested" && <Invitations />}
			{downline.status === "in-downline" && (
				<Tabs
					value={selectedTab}
					onValueChange={tabChange}
					className="w-full"
				>
					<TabsList className="grid w-full max-w-lg mx-auto mb-4 grid-cols-3">
						<TabsTrigger value="list">List View</TabsTrigger>
						<TabsTrigger value="visualizer">Visualizer</TabsTrigger>
						{/* <TabsTrigger value="manageCategories">
							Manage Categories
						</TabsTrigger> */}
						<TabsTrigger value="clients">Clients</TabsTrigger>
					</TabsList>

					<TabsContent value="list">
						<div className="flex flex-col gap-4">
							<CreateInvitation />
							<CoachesList />
						</div>
					</TabsContent>

					<TabsContent value="visualizer">
						<Card className="bg-gray-800 border-gray-700">
							<CardContent className="p-4">
								<h4 className="text-xl mb-4 text-center font-semibold text-white">
									Downline Visualizer
								</h4>
								<TreeVisualizer initialNode={initialNodeData} />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="manageCategories">
						{categoriesLoading && <ContentLoader />}
						{categoriesError && (
							<ContentError title={categoriesError.message} />
						)}
						{categories && (
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<h2 className="text-3xl font-bold">Manage Your Categories</h2>
									<ManageCategoryModal onSave={mutateCategories}>
										<Button>
											<PlusCircle className="mr-2 h-4 w-4" /> Create New
											Category
										</Button>
									</ManageCategoryModal>
								</div>
								<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									{categories.map((category) => (
										<Card
											key={category._id}
											className="flex flex-col bg-white dark:bg-slate-800"
										>
											<CardHeader>
												<CardTitle className="flex items-center justify-between">
													{category.name}
													<div className="flex items-center space-x-2">
														<ManageCategoryModal
															category={category}
															onSave={mutateCategories}
														>
															<Button variant="ghost" size="icon">
																<Edit className="h-4 w-4" />
															</Button>
														</ManageCategoryModal>
														<DualOptionActionModal
															title="Delete Category"
															description={`Are you sure you want to delete the "${category.name}" category?`}
															action={(setLoading, btnRef) =>
																handleDeleteCategory(
																	setLoading,
																	btnRef,
																	category._id
																)
															}
														>
															<AlertDialogTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="text-red-500 hover:text-red-600"
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</AlertDialogTrigger>
														</DualOptionActionModal>
													</div>
												</CardTitle>
											</CardHeader>
											<CardContent className="flex-grow space-y-4">
												<p className="text-sm text-gray-500 dark:text-gray-400">
													{category.description}
												</p>
												<div>
													<h4 className="font-semibold text-base">
														Permissions:
													</h4>
													<ul className="list-disc pl-5 text-sm space-y-1 mt-2">
														<li>
															Club Access:{" "}
															<b>{category.permissions.clubAccess}</b>
														</li>
														<li>
															Category Creation:{" "}
															<b>
																{category.permissions.categoryCreationAccess}
															</b>
														</li>
														<li>
															Downline Management:{" "}
															<b>
																{category.permissions.downlineManagementAccess}
															</b>
														</li>
													</ul>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
								{categories.length === 0 && (
									<p className="text-center py-8 text-gray-500">
										You haven't created any categories yet.
									</p>
								)}
							</div>
						)}
					</TabsContent>

					<TabsContent value="clients">
						<DownlineClientList />
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}

// --- The functions below remain unchanged ---

function Invitations() {
	const { isLoading, error, data } = useSWR("app/downline", () =>
		retrieveDownlineRequests()
	);

	if (isLoading) return <ContentLoader />;

	if (error || data.status_code !== 200)
		return <ContentError title={error || data.message} />;

	const invitations = data?.data || [];

	if (invitations.length === 0) return <></>;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="!text-[28px]">Invitations</h4>
				<StartDownline />
			</div>
			{invitations.map((invitation, index) => (
				<Card
					className="w-full max-w-md bg-[var(--comp-1)] border-2 border-[var(--accent-1)] rounded-lg p-0"
					key={index}
				>
					<CardContent className="flex flex-col gap-4 p-4">
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 rounded-md overflow-hidden">
								<Avatar className="h-[60px] w-[60px] border-1">
									<AvatarImage src={invitation.profilePhoto} />
									<AvatarFallback>
										{nameInitials(invitation.name)}
									</AvatarFallback>
								</Avatar>
							</div>

							<div className="flex flex-col">
								<h2 className="text-lg font-semibold">
									{invitation.name}{" "}
									<span className="text-gray-500 text-sm">
										#{invitation.coachId}
									</span>
								</h2>
								<p className="text-sm text-gray-600">{invitation.email}</p>
								<p className="text-sm text-gray-600">
									{invitation.mobileNumber}
								</p>
							</div>
						</div>
						<hr />
						<div className="flex items-center justify-between">
							<p className="text-sm text-gray-400">
								Respond to this Invitation
							</p>
							<div className="flex gap-2">
								<ActionOnRequest
									actionType="ACCEPT_INVITE"
									coachId={invitation._id}
								>
									<Button
										variant="default"
										className="bg-green-500 hover:bg-green-600"
									>
										Confirm
									</Button>
								</ActionOnRequest>
								<ActionOnRequest
									actionType="DECLINE_INVITE"
									coachId={invitation._id}
								>
									<Button
										variant="default"
										className="bg-red-500 hover:bg-red-600"
									>
										Decline
									</Button>
								</ActionOnRequest>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function CreateInvitation() {
	const [coachId, setCoachId] = useState("");
	return (
		<div className="bg-[var(--comp-2)] w-full px-4 py-8 border-1 rounded-[8px]">
			<h4 className="mb-4">Invite a Coach</h4>
			<div className="flex flex-col gap-4">
				<FormControl
					type="text"
					placeholder="Enter Coach ID"
					value={coachId}
					onChange={(e) => setCoachId(e.target.value)}
					className="h-12"
				/>
				{coachId.length > 0 && (
					<ActionOnRequest coachId={coachId} actionType="INVITE">
						<Button variant="wz" className="max-w-xs w-full mx-auto">
							Invite Coach
						</Button>
					</ActionOnRequest>
				)}
			</div>
		</div>
	);
}

function CoachesList() {
	const [query, setQuery] = useState("")
	const { isLoading, error, data, mutate } = useSWR(
		"app/downline/coaches",
		retrieveDownlineCoaches
	);

	if (isLoading) return <ContentLoader />;

	if (error || data.status_code !== 200)
		return <ContentError title={error?.message || data.message} />;

	const allCoaches = data?.data || [];
	const coaches = allCoaches.filter(coach => new RegExp(query, "i").test(coach.name));

	const handleMakeTop = async (coachId) => {
		try {
			toast.info("Make Top functionality - API endpoint needs to be implemented");
		} catch (error) {
			toast.error(error.message);
		}
	};

	return (
		<div className="bg-[var(--comp-2)] px-4 py-8 rounded-[8px] space-y-4 border-1">
			<h4 className="mb-4">Coaches under You ({allCoaches.length})</h4>
			<FormControl
				value={query}
				onChange={e => setQuery(e.target.value)}
				className="block [&_.input]:bg-white mb-4"
				placeholder="Search Coach Name..."
			/>

			<HierarchicalCoachTable
				coaches={coaches}
				onMakeTop={handleMakeTop}
			/>
		</div>
	);
}

function StartDownline() {
	async function startDownline(setLoading, closeBtnRef) {
		try {
			setLoading(true);
			const response = await sendData("app/downline/requests", {}, "PUT");
			if (response.status_code !== 200) throw new Error(response.message);
			toast.success(response.message);
			closeBtnRef.current.click();
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<DualOptionActionModal
			asChild
			description="Are you sure to start your downline?"
			action={(setLoading, btnRef) => startDownline(setLoading, btnRef)}
		>
			<AlertDialogTrigger asChild>
				<Button variant="wz">Start Downline</Button>
			</AlertDialogTrigger>
		</DualOptionActionModal>
	);
}

function ActionOnRequest({
	children,
	actionType,
	coachId
}) {
	async function actionOnRequest(setLoading) {
		try {
			setLoading(true);
			const response = await sendData("app/downline/requests", { actionType, coachId }, "PATCH");
			if (response.status_code !== 200) throw new Error(response.message);
			toast.success(response.message);
			location.reload()
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}

	return <DualOptionActionModal
		action={(setLoading, btnRef) => actionOnRequest(setLoading, btnRef)}
	>
		<AlertDialogTrigger asChild>
			{children}
		</AlertDialogTrigger>
	</DualOptionActionModal>
}

export function SyncCoachComponent({ coach }) {
	const { clubType } = useAppSelector((state) => state.coach.data)
	if (!["Club Leader", "System Leader"].includes(clubType)) return null

	return (
		<div className="flex items-center gap-2">
			<SyncCoachDropdown
				coachId={coach._id}
				status={coach.super_coach?.status}
			/>
		</div>
	)
}

function SyncCoachDropdown({ coachId, status }) {
	const [loading, setLoading] = useState(false)
	const [openModal, setOpenModal] = useState(false)
	const [pendingStatus, setPendingStatus] = useState(null)

	const currentStatus = status === 2 ? "Synced" : "Unsynced"

	async function handleSyncAction(setLoadingFn, closeRef) {
		try {
			setLoadingFn(true)
			const response = await sendData(`app/sync-coach/super`, {
				status: pendingStatus,
				coachId,
			})
			if (response.status_code !== 200) throw new Error(response.message)
			toast.success(response.message)
			location.reload()
			closeRef.current.click()
		} catch (error) {
			toast.error(error.message)
		} finally {
			setLoadingFn(false)
			setOpenModal(false)
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						size="sm"
						variant={"icon"}
						disabled={loading}
						className={cn(
							"h-auto py-[6px]",
							currentStatus === "Synced"
								? "bg-[var(--accent-1)] text-white font-bold text-[14px]"
								: "bg-[var(--accent-2)] text-white font-bold text-[14px]"
						)}
					>
						{currentStatus}
						<ChevronDown className="h-[20px] w-[20px]" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={() => {
							setPendingStatus(2)
							setOpenModal(true)
						}}
						disabled={loading || status === 2}
					>
						Sync
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							setPendingStatus(3)
							setOpenModal(true)
						}}
						disabled={loading || status === 3}
						className="text-destructive"
					>
						Unsync
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Confirmation Modal */}
			{openModal && (
				<DualOptionActionModal
					defaultOpen
					description={`Are you sure you want to ${pendingStatus === 2 ? "sync" : "unsync"
						} this coach?`}
					action={handleSyncAction}
					onClose={() => setOpenModal(false)}
				/>
			)}
		</>
	)
}

function DownlineClientList() {
	const { isLoading, error, data } = useSWR(
		"downline-clients",
		() => retrieveClientList()
	);

	if (isLoading) return <ContentLoader />

	if (error || data.status_code !== 200) return <ContentError title={error?.message || data.message} />
	const clients = data.data || [];

	return <div className="bg-[var(--comp-1)] p-4 rounded-[10px] border-1">
		{/* <h2>Client List</h2> */}
		<Table className="border-1 mt-4">
			<TableHeader>
				<TableRow className="bg-white [&_th]:font-bold">
					<TableHead>Name</TableHead>
					<TableHead>Coach</TableHead>
					<TableHead>Client ID</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Mobile</TableHead>
					<TableHead>City</TableHead>
					<TableHead />
				</TableRow>
			</TableHeader>
			<TableBody>
				{clients.map((client) => (
					<TableRow key={client._id}>
						<TableCell className="font-medium">{client.name}</TableCell>
						<TableCell>{client.coach}</TableCell>
						<TableCell>{client.clientId}</TableCell>
						<TableCell>{client.email || "-"}</TableCell>
						<TableCell>{client.mobileNumber || "-"}</TableCell>
						<TableCell>{client.city || "-"}</TableCell>
						{<TableCell onClick={e => e.stopPropagation()}>
							<SyncedCoachClientDetails
								client={client}
								onUpdate={() => location.reload()}
							>
								<DialogTrigger>
									<Eye className="hover:text-[var(--accent-1)] opacity-50 hover:opacity-100" />
								</DialogTrigger>
							</SyncedCoachClientDetails>
						</TableCell>}
					</TableRow>
				))}
				{clients.length === 0 && (
					<TableRow>
						<TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
							No clients found
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	</div>
}