<template>
	<div>
		<ContextMenu ref="contextMenu" :options="contextMenuOptions" />
		<NewComponent v-if="block" :block="block" v-model="showNewComponentDialog"></NewComponent>
		<NewBlockTemplate v-if="block" :block="block" v-model="showBlockTemplateDialog"></NewBlockTemplate>
	</div>
</template>
<script setup lang="ts">
import type Block from "@/block";
import ContextMenu from "@/components/ContextMenu.vue";
import NewBlockTemplate from "@/components/Modals/NewBlockTemplate.vue";
import NewComponent from "@/components/Modals/NewComponent.vue";
import useBuilderStore from "@/stores/builderStore";
import useCanvasStore from "@/stores/canvasStore";
import useComponentStore from "@/stores/componentStore";
import getBlockTemplate from "@/utils/blockTemplate";
import { confirm, detachBlockFromComponent, getBlockCopy, triggerCopyEvent } from "@/utils/helpers";
import { useStorage } from "@vueuse/core";
import { Ref, nextTick, ref } from "vue";
import { toast } from "vue-sonner";

const builderStore = useBuilderStore();
const componentStore = useComponentStore();
const canvasStore = useCanvasStore();

const contextMenu = ref(null) as unknown as Ref<InstanceType<typeof ContextMenu>>;
const triggeredFromLayersPanel = ref(false);

const block = ref(null) as unknown as Ref<Block>;

const showNewComponentDialog = ref(false);
const showBlockTemplateDialog = ref(false);
const target = ref(null) as unknown as Ref<HTMLElement>;

const showContextMenu = (event: MouseEvent, refBlock: Block) => {
	block.value = refBlock;
	// check if the event is triggered from layers panel
	target.value = event.target as HTMLElement;
	const layersPanel = target.value.closest(".block-layers");
	triggeredFromLayersPanel.value = Boolean(layersPanel);
	if (block.value.isRoot()) return;
	contextMenu.value?.show(event);
};

const copiedStyle = useStorage("copiedStyle", { blockId: "", style: {} }, sessionStorage) as Ref<StyleCopy>;

const copyStyle = () => {
	copiedStyle.value = {
		blockId: block.value.blockId,
		style: block.value.getStylesCopy(),
	};
};

const pasteStyle = () => {
	block.value.updateStyles(copiedStyle.value?.style as BlockStyleObjects);
};

const duplicateBlock = () => {
	block.value.duplicateBlock();
};

const contextMenuOptions: ContextMenuOption[] = [
	{
		label: "Редактировать HTML",
		action: () => {
			canvasStore.editHTML(block.value);
		},
		condition: () => block.value.isHTML(),
	},
	{ label: "Копировать", action: () => triggerCopyEvent() },
	{ label: "Копировать стиль", action: copyStyle },
	{
		label: "Вставить стиль",
		action: pasteStyle,
		condition: () => Boolean(copiedStyle.value.blockId && copiedStyle.value?.blockId !== block.value.blockId),
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Дублировать",
		action: duplicateBlock,
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Преобразовать в коллекцию",
		action: () => {
			block.value.isRepeaterBlock = true;
			toast.warning("Пожалуйста, выберите коллекцию");
		},
		condition: () =>
			block.value.isContainer() &&
			!block.value.isRoot() &&
			!block.value.isRepeater() &&
			!block.value.isChildOfComponentBlock() &&
			!block.value.isExtendedFromComponent(),
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Удалить коллекцию",
		action: () => {
			block.value.isRepeaterBlock = false;
			block.value.dataKey = {};
		},
		condition: () => block.value.isRepeater(),
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Обернуть в контейнер",
		action: () => {
			const newBlockObj = getBlockTemplate("fit-container");
			const parentBlock = block.value.getParentBlock();
			if (!parentBlock) return;

			const selectedBlocks = canvasStore.activeCanvas?.selectedBlocks || [];
			const blockPosition = Math.min(...selectedBlocks.map(parentBlock.getChildIndex.bind(parentBlock)));
			const newBlock = parentBlock?.addChild(newBlockObj, blockPosition);

			let width = null as string | null;
			// move selected blocks to newBlock
			selectedBlocks
				.sort((a: Block, b: Block) => parentBlock.getChildIndex(a) - parentBlock.getChildIndex(b))
				.forEach((block: Block) => {
					parentBlock?.removeChild(block);
					newBlock?.addChild(block);
					if (!width) {
						const blockWidth = block.getStyle("width") as string | undefined;
						if (blockWidth && (blockWidth == "auto" || blockWidth.endsWith("%"))) {
							width = "100%";
						}
					}
				});

			if (width) {
				newBlock?.setStyle("width", width);
			}

			nextTick(() => {
				if (newBlock) {
					newBlock.selectBlock();
				}
			});
		},
		condition: () => {
			if (block.value.isRoot()) return false;
			if (canvasStore.activeCanvas?.selectedBlocks.length === 1) return true;
			// check if all selected blocks are siblings
			const parentBlock = block.value.getParentBlock();
			if (!parentBlock) return false;
			const selectedBlocks = canvasStore.activeCanvas?.selectedBlocks || [];
			return selectedBlocks.every((block: Block) => block.getParentBlock() === parentBlock);
		},
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Повторить блок",
		action: () => {
			const repeaterBlockObj = getBlockTemplate("repeater");
			const parentBlock = block.value.getParentBlock();
			if (!parentBlock) return;
			const repeaterBlock = parentBlock.addChild(repeaterBlockObj, parentBlock.getChildIndex(block.value));
			repeaterBlock.addChild(getBlockCopy(block.value));
			parentBlock.removeChild(block.value);
			repeaterBlock.selectBlock();
			toast.warning("Пожалуйста, выберите коллекцию");
		},
		condition: () =>
			!block.value.isRoot() && !block.value.isRepeater() && !block.value.isChildOfComponentBlock(),
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Сбросить переопределения",
		condition: () => canvasStore.activeCanvas?.activeBreakpoint !== "desktop",
		disabled: () =>
			builderStore.readOnlyMode ||
			!block.value?.hasOverrides(canvasStore.activeCanvas?.activeBreakpoint || "desktop"),
		action: () => {
			block.value.resetOverrides(canvasStore.activeCanvas?.activeBreakpoint || "desktop");
		},
	},
	{
		label: "Сбросить изменения",
		action: () => {
			if (block.value.hasChildren()) {
				confirm("Сбросить изменения в дочерних блоках тоже?").then((confirmed) => {
					block.value.resetChanges(confirmed);
				});
			} else {
				block.value.resetChanges();
			}
		},
		condition: () => block.value.isExtendedFromComponent(),
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Синхронизировать компонент",
		condition: () => Boolean(block.value.extendedFromComponent),
		action: () => {
			block.value.syncWithComponent();
		},
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Сбросить компонент",
		condition: () => Boolean(block.value.extendedFromComponent),
		action: () => {
			confirm("Вы уверены, что хотите сбросить?").then((confirmed) => {
				if (confirmed) {
					block.value.resetWithComponent();
				}
			});
		},
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Редактировать компонент",
		action: () => {
			componentStore.editComponent(block.value);
		},
		condition: () => block.value.isExtendedFromComponent(),
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Сохранить как шаблон блока",
		action: () => {
			showBlockTemplateDialog.value = true;
		},
		condition: () => !block.value.isExtendedFromComponent() && Boolean(window.is_developer_mode),
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Сохранить как компонент",
		action: () => (showNewComponentDialog.value = true),
		condition: () => !block.value.isExtendedFromComponent(),
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Отсоединить компонент",
		action: () => {
			const newBlock = detachBlockFromComponent(block.value, null);
			if (newBlock) {
				newBlock.selectBlock();
			}
			block.value.getParentBlock()?.replaceChild(block.value, newBlock);
		},
		condition: () => Boolean(block.value.extendedFromComponent),
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Переименовать",
		action: () => {
			const layerLabel = target.value?.closest("[data-block-layer-id]")?.querySelector(".layer-label");
			if (layerLabel) {
				layerLabel.dispatchEvent(new Event("dblclick"));
				nextTick(() => {
					// selct all text in the layerLabel
					const range = document.createRange();
					range.selectNodeContents(layerLabel);
					const selection = window.getSelection();
					if (selection) {
						selection.removeAllRanges();
						selection.addRange(range);
					}
				});
			}
		},
		condition: () =>
			!block.value.isRoot() && !block.value.isChildOfComponentBlock() && triggeredFromLayersPanel.value,
		disabled: () => builderStore.readOnlyMode,
	},
	{
		label: "Удалить",
		action: () => {
			const selectedBlocks = canvasStore.activeCanvas?.selectedBlocks || [];
			selectedBlocks.forEach((selectedBlock: Block) => {
				canvasStore.activeCanvas?.removeBlock(selectedBlock);
			});
		},
		condition: () => {
			return (
				!block.value.isRoot() &&
				!block.value.isChildOfComponentBlock() &&
				block.value.isVisible() &&
				Boolean(block.value.getParentBlock())
			);
		},
		disabled: () => builderStore.readOnlyMode,
	},
];

defineExpose({
	showContextMenu,
});
</script>
