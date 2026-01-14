"use client";

import React, { useEffect, useRef, useState } from "react";
import { Network } from "vis-network/standalone";
import { DataSet } from "vis-data/peer";
import { toast } from "sonner";
import { fetchData, sendData } from "@/lib/api";
import { Eye, Plus, Trash2, Settings, Edit } from "lucide-react";
import { UpdateDetails } from "@/app/(authorized)/coach/downline/coach/[id]/page";
import { nameInitials } from "@/lib/formatter";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { mutate } from "swr";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const options = {
	layout: {
		hierarchical: {
			enabled: false
		},
	},
	physics: {
		enabled: true,
		forceAtlas2Based: {
			theta: 0.5,
			gravitationalConstant: -50,
			centralGravity: 0.01,
			springConstant: 0.08,
			springLength: 100,
			damping: 0.4,
			avoidOverlap: 0
		},
		repulsion: {
			centralGravity: 0.2,
			springLength: 200,
			springConstant: 0.05,
			nodeDistance: 100,
			damping: 0.09
		},
		hierarchicalRepulsion: {
			centralGravity: 0.0,
			springLength: 100,
			springConstant: 0.01,
			nodeDistance: 120,
			damping: 0.09,
			avoidOverlap: 0
		},
		maxVelocity: 50,
		minVelocity: 0.1,
		solver: 'barnesHut',
		stabilization: {
			enabled: true,
			iterations: 1000,
			updateInterval: 100,
			onlyDynamicEdges: false,
			fit: true
		},
		timestep: 0.5,
		adaptiveTimestep: true,
		wind: { x: 0, y: 0 }
	},
	nodes: {
		shape: "circle",
		size: 30,
		font: { size: 16, color: "#e0e0e0", face: "Arial" },
		borderWidth: 2,
		color: {
			border: "#00aeff",
			background: "#3c3c3c",
			highlight: { border: "#ffffff", background: "#555555" },
			hover: { border: "#ffffff", background: "#444444" },
		},
	},
	edges: {
		width: 2,
		arrows: { to: { enabled: true, scaleFactor: 0.8 } },
		color: { color: "#666666", highlight: "#00aeff", hover: "#888888" },
	},
	interaction: {
		hover: true,
		tooltipDelay: 200,
		navigationButtons: true,
		hideEdgesOnDrag: true,
		multiselect: false,
	},
};

const TreeVisualizer = ({ initialNode }) => {
	const [networkInstance, setNetworkInstance] = useState(null);
	const [expandedNodes, setExpandedNodes] = useState(new Set());
	const [hoveredNode, setHoveredNode] = useState(null);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	const visJsRef = useRef(null);
	const nodes = useRef(new DataSet()).current;
	const edges = useRef(new DataSet()).current;

	const expandNode = async (nodeId) => {
		if (!nodeId || expandedNodes.has(nodeId)) {
			return;
		}
		try {
			const body = await fetchData(`app/downline/visualizer/${nodeId}`);
			if (body.status_code !== 200) {
				const errorData = await response.json();
				toast.error(errorData.message || "Failed to fetch downline data");
				return;
			}

			if (body.status_code === 200 && body.data) {
				const { nodes: newNodes, edges: newEdges } = body.data;
				if (newNodes && newNodes.length > 0) {
					const nodesWithDetails = newNodes.map((node) => {
						return {
							...node,
							name: node.label,
							label: nameInitials(node.label),
							size: 30,
							font: { size: 16, color: "#e0e0e0" },
							color: {
								border: "#00aeff",
								background: "#3c3c3c",
								highlight: { border: "#ffffff", background: "#555555" },
								hover: { border: "#ffffff", background: "#444444" },
							},
						};
					});
					const edgesWithIds = newEdges.map((edge) => ({
						...edge,
						id: `${edge.from}-${edge.to}`,
					}));
					nodes.update(nodesWithDetails);
					edges.update(edgesWithIds);
				}
				setExpandedNodes((prev) => new Set(prev).add(nodeId));
			}
		} catch (error) {
			toast.error(error.message);
		}
	};

	useEffect(() => {
		const data = { nodes, edges };
		const network = visJsRef.current && new Network(visJsRef.current, data, options);

		network?.on("click", (params) => {
			if (params.nodes.length > 0) {
				const nodeId = params.nodes[0];
				expandNode(nodeId);
			} else {
				setHoveredNode(null);
			}
		});

		network?.on("hoverNode", (params) => {
			const nodeId = params.node;
			const nodeData = nodes.get(nodeId);
			const position = network.getPositions([nodeId])[nodeId];
			const canvasPosition = network.canvasToDOM(position);

			setMousePosition({
				x: canvasPosition.x,
				y: canvasPosition.y
			});
			setHoveredNode({
				id: nodeId,
				data: nodeData
			});
		});

		network?.on("blurNode", () => {
			setHoveredNode(null);
		});

		if (initialNode && nodes.length === 0) {
			nodes.add({
				...initialNode,
				size: 30,
				font: { size: 16, color: "#e0e0e0" },
				color: {
					...initialNode.color,
					border: "#00aeff",
					background: "#3c3c3c",
				},
			});
		}

		setNetworkInstance(network);
		return () => {
			network?.destroy();
			setNetworkInstance(null);
		};
	}, [initialNode]);

	return (
		<div className="relative">
			<div
				ref={visJsRef}
				style={{
					height: "70vh",
					width: "100%",
					background: "#22272e",
					borderRadius: "8px",
				}}
			/>
			{hoveredNode && (
				<div
					className="absolute z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[250px] border border-gray-200"
					style={{
						left: mousePosition.x + 20,
						top: mousePosition.y - 20,
						transform: 'translate(0, -50%)',
					}}
				>
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between border-b pb-2">
							<div>
								<div className="text-sm font-medium text-gray-900">{hoveredNode.data.name}</div>
								<div className="text-xs text-gray-500">ID: {hoveredNode.id}</div>
							</div>
							<Settings className="w-4 h-4 text-gray-400" />
						</div>

						<div className="space-y-1">
							<div className="text-xs text-gray-600">
								<span className="font-medium">Email:</span> {hoveredNode.data.email}
							</div>
							<div className="text-xs text-gray-600">
								<span className="font-medium">Total Clients:</span> {hoveredNode.data.totalClients || 0}
							</div>
						</div>

						<div className="flex items-center gap-2 pt-2 border-t">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Link
											href={`/coach/downline/coach/${hoveredNode.id}`}
											className="p-2 hover:bg-gray-100 rounded-full transition-colors"
										>
											<Eye className="w-4 h-4 text-blue-600" />
										</Link>
									</TooltipTrigger>
									<TooltipContent>
										<p>View Details</p>
									</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<div className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
											<UpdateDetails
												actionType="UPDATE_COACH"
												title="Coach Details"
												user={{
													_id: hoveredNode.id,
													email: hoveredNode.data.email,
													city: hoveredNode.data.city,
													name: hoveredNode.data.name,
													mobileNumber: hoveredNode.data.mobileNumber,
													rollno: hoveredNode.data.rollno
												}}
											>
												<Edit className="w-4 h-4 text-amber-600" />
											</UpdateDetails>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>Edit Coach</p>
									</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<div className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
											<AppendCoachDownlineHierarchy parentCoachId={hoveredNode.id}>
												<Plus className="w-4 h-4 text-green-600" />
											</AppendCoachDownlineHierarchy>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>Add Downline</p>
									</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<div className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
											<DetachCoachDownlineHierarchy coachId={hoveredNode.id}>
												<Trash2 className="w-4 h-4 text-red-600" />
											</DetachCoachDownlineHierarchy>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>Remove from Downline</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

function CoachActions({
	coachId,
	coachData,
	positions
}) {
	return <div
		// className="absolute top-0 left-0 text-white text-xs bg-black bg-opacity-50 p-1 rounded z-[1000000]"
		// style={{
		// 	transform: `translate(${positions?.x}px, ${positions?.y}px)`,
		// 	pointerEvents: 'none'
		// }}
		className="bg-white px-4 py-1 rounded-[4px] border-1"
	>
		{coachData?.label} -
		<Link href={`/coach/downline/coach/${coachId}`}>
			<Eye />
		</Link>
		<UpdateDetails
			actionType="UPDATE_COACH"
			title="Coach Details"
			user={{
				_id: coachId,
				email: coachData.email,
				city: coachData.city,
				name: coachData.name,
				mobileNumber: coachData.mobileNumber,
				rollno: coachData.rollno
			}}
		/>
		<AppendCoachDownlineHierarchy
			parentCoachId={coachId}
		/>
		<DetachCoachDownlineHierarchy coachId={coachId} />
	</div>
}

function AppendCoachDownlineHierarchy({ parentCoachId, children }) {
	const [loading, setLoading] = useState(false);
	const [childCoachId, setChildCoachId] = useState("")

	async function appendCoachInDownline() {
		try {
			setLoading(true);
			const response = await sendData("app/downline/manage/hierarchy", {
				parentCoachId,
				childCoachId
			});
			if (response.status_code !== 200) throw new Error(response.message);
			toast.success(response.message);
			mutate("app/downline");
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}

	return <Dialog>
		<DialogTrigger asChild>
			{children || <Plus />}
		</DialogTrigger>
		<DialogContent className="sm:max-w-[425px]">
			<DialogTitle className="text-lg font-semibold">Add Coach to Downline</DialogTitle>
			<div className="grid gap-4 py-4">
				<FormControl
					label="Coach ID"
					placeholder="Enter coach ID to add"
					value={childCoachId}
					onChange={e => setChildCoachId(e.target.value)}
				/>
				<Button
					onClick={appendCoachInDownline}
					disabled={loading || !childCoachId.trim()}
					className="w-full"
				>
					{loading ? "Adding..." : "Add to Downline"}
				</Button>
			</div>
		</DialogContent>
	</Dialog>
}

function DetachCoachDownlineHierarchy({ coachId, children }) {
	async function detachCoachInDownline(setLoading, closeBtnRef) {
		try {
			setLoading(true);
			const response = await sendData(
				"app/downline/manage/hierarchy",
				{ coachId },
				"PUT"
			);
			if (response.status_code !== 200) throw new Error(response.message);
			toast.success(response.message);
			mutate("app/downline");
			closeBtnRef.current.click();
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}

	return <DualOptionActionModal
		title="Remove Coach"
		description="Are you sure you want to remove this coach from the downline? This action cannot be undone."
		action={(setLoading, btnRef) => detachCoachInDownline(setLoading, btnRef)}
		confirmText="Remove"
		cancelText="Cancel"
	>
		<AlertDialogTrigger asChild>
			{children || <Trash2 className="w-[28px] h-[28px] text-white bg-[var(--accent-2)] p-[6px] rounded-[4px]" />}
		</AlertDialogTrigger>
	</DualOptionActionModal>
}

export default TreeVisualizer;