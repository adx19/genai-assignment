"use client";

import { motion } from "framer-motion";

import {
	IconFileText,
	IconPlus,
	IconSparkles,
	IconX,
	IconClock,
	IconTrash,
} from "@tabler/icons-react";

import {
	useEffect,
	useState,
} from "react";

import UploadModal from "../upload/upload-modal";

type SidebarProps = {
	mobileOpen: boolean;
	setMobileOpen: (open: boolean) => void;
};

type DocumentType = {
	id: string;
	filename: string;
	status: string;
	active: boolean;
	uploadedAt?: string;
};

export default function Sidebar({
	mobileOpen,
	setMobileOpen,
}: SidebarProps) {
	const [open, setOpen] =
		useState(false);

	const [documents, setDocuments] =
		useState<DocumentType[]>([]);

	const API =
		"https://genai-assignment-dotk.onrender.com";

	const fetchDocuments =
		async () => {
			try {
				const res =
					await fetch(
						`${API}/api/documents`
					);

				if (!res.ok) {
					throw new Error(
						"Failed to fetch documents"
					);
				}

				const data =
					await res.json();

				setDocuments(
					data.documents ||
						[]
				);
			} catch (err) {
				console.error(
					err
				);
			}
		};

	const selectDocument =
		async (
			id: string
		) => {
			try {
				await fetch(
					`${API}/api/documents/${id}/select`,
					{
						method:
							"POST",
					}
				);
				
				

				setDocuments(
					(prev) =>
						prev.map(
							(
								doc
							) => ({
								...doc,

								active:
									doc.id ===
									id,
							})
						)
				);
				
				window.dispatchEvent(new Event("documentsUpdated"));
			} catch (err) {
				console.error(
					err
				);
			}
		};

	const deleteDocument =
		async (
			e: React.MouseEvent,
			id: string
		) => {
			e.stopPropagation();

			try {
				await fetch(
					`${API}/api/documents/${id}`,
					{
						method:
							"DELETE",
					}
				);
	
				window.dispatchEvent(new Event("documentsUpdated"));

				setDocuments(
					(prev) =>
						prev.filter(
							(
								doc
							) =>
								doc.id !==
								id
						)
				);
			} catch (err) {
				console.error(
					err
				);
			}
		};

	useEffect(() => {
		fetchDocuments();
		
		const updateDocuments=()=>{
			fetchDocuments();
		};
		
		window.addEventListener("documentsUpdated",updateDocuments);
		
		return ()=>{
			window.removeEventListener("documentsUpdated", updateDocuments);
		};

	}, []);

	return (
		<>
			<UploadModal
				open={open}
				setOpen={
					setOpen
				}
			/>

			{mobileOpen && (
				<div
					onClick={() =>
						setMobileOpen(
							false
						)
					}
					className="
						fixed
						inset-0
						bg-black/60
						backdrop-blur-sm
						z-40
						lg:hidden
					"
				/>
			)}

			<motion.div
				initial={{
					x: -40,
					opacity: 0,
				}}
				animate={{
					x: 0,
					opacity: 1,
				}}
				transition={{
					duration:
						0.4,
				}}
				className={`
					fixed lg:relative z-50
					h-full
					w-[300px]
					border-r
					border-white/10
					bg-[#090909]/95
					backdrop-blur-2xl
					flex
					flex-col
					overflow-hidden
					transition-transform
					duration-300

					${
						mobileOpen
							? "translate-x-0"
							: "-translate-x-full"
					}

					lg:translate-x-0
				`}
			>
				<div className="p-5 border-b border-white/10">

					<div className="flex items-center justify-between">

						<div className="flex items-center gap-3">

							<div
								className="
									h-11
									w-11
									rounded-2xl
									bg-gradient-to-br
									from-violet-500
									to-blue-500
									flex
									items-center
									justify-center
									shadow-lg
									shadow-violet-500/20
								"
							>
								<IconSparkles
									size={
										22
									}
								/>
							</div>

							<div>
								<h1 className="text-lg font-semibold tracking-tight">
									DocuMind
								</h1>

								<p className="text-xs text-white/40">
									AI
									Document
									Workspace
								</p>
							</div>

						</div>

						<button
							onClick={() =>
								setMobileOpen(
									false
								)
							}
							className="
								lg:hidden
								text-white/60
								hover:text-white
							"
						>
							<IconX
								size={
									22
								}
							/>
						</button>

					</div>

					<button
						onClick={() =>
							setOpen(
								true
							)
						}
						className="
							mt-6
							w-full
							rounded-2xl
							bg-gradient-to-r
							from-violet-600
							to-blue-600
							p-4
							flex
							items-center
							justify-center
							gap-2
							font-medium
							hover:scale-[1.02]
							transition
						"
					>
						<IconPlus
							size={
								18
							}
						/>

						Upload
						Document
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-5">

					<div className="flex items-center justify-between mb-5">

						<p className="text-xs uppercase tracking-[0.2em] text-white/40">
							Documents
						</p>

						<div className="text-xs text-white/30">
							{
								documents.length
							}
						</div>

					</div>

					<div className="space-y-3">

						{documents.map(
							(
								doc
							) => (
								<motion.div
									key={
										doc.id
									}
									whileHover={{
										scale:
											1.02,
									}}
									onClick={() =>
										selectDocument(
											doc.id
										)
									}
									className={`
										group
										relative
										rounded-3xl
										border
										p-4
										cursor-pointer
										transition

										${
											doc.active
												? "border-violet-500 bg-violet-500/10"
												: "border-white/10 bg-white/[0.03]"
										}
									`}
								>

									<button
										onClick={(
											e
										) =>
											deleteDocument(
												e,
												doc.id
											)
										}
										className="
											absolute
											top-4
											right-4
											opacity-0
											group-hover:opacity-100
											text-red-400
											hover:text-red-300
											transition
										"
									>
										<IconTrash
											size={
												16
											}
										/>
									</button>

									<div className="flex items-start gap-3">

										<div
											className="
												h-10
												w-10
												rounded-2xl
												bg-white/10
												flex
												items-center
												justify-center
											"
										>
											<IconFileText
												size={
													18
												}
											/>
										</div>

										<div className="min-w-0 flex-1">

											<h2 className="text-sm font-medium truncate text-white/90">
												{
													doc.filename
												}
											</h2>

											<div className="flex items-center gap-2 mt-2">

												<div
													className={`
														h-2
														w-2
														rounded-full

														${
															doc.active
																? "bg-violet-400"
																: "bg-emerald-400"
														}
													`}
												/>

												<p className="text-xs text-white/40">
													{
														doc.status
													}
												</p>

											</div>

											<div className="flex items-center gap-1 mt-2 text-white/25">

												<IconClock
													size={
														12
													}
												/>

												<p className="text-[11px]">
													{doc.active
														? "Current session"
														: "In store"}
												</p>

											</div>

										</div>

									</div>

								</motion.div>
							)
						)}

					</div>

				</div>

				<div className="p-5 border-t border-white/10">

					<div
						className="
							rounded-3xl
							border
							border-white/10
							bg-white/[0.03]
							p-4
						"
					>
						<p className="text-sm text-white/60">
							Built with
							Next.js,
							Express,
							Groq &
							RAG AI
						</p>
					</div>

				</div>

			</motion.div>
		</>
	);
}
