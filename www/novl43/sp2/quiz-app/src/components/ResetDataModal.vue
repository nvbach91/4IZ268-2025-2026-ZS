<script setup>
import { watch, ref } from "vue";

/**
 * Props:
 * - open: whether modal is visible
 */
const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "reset-all", "reset-progress"]);

/**
 * Focus handling (so Escape works immediately after opening)
 */
const backdropRef = ref(null);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      // focus backdrop on next tick (safe even without nextTick in most cases)
      setTimeout(() => backdropRef.value?.focus(), 0);
    }
  }
);

/**
 * Close when clicking outside the modal content
 */
const onBackdropClick = (e) => {
  if (e.target === e.currentTarget) emit("close");
};

/**
 * Close on Escape
 */
const onKeydown = (e) => {
  if (e.key === "Escape") emit("close");
};
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      ref="backdropRef"
      class="modal-backdrop"
      tabindex="0"
      @click="onBackdropClick"
      @keydown="onKeydown"
    >
      <div class="modal" role="dialog" aria-modal="true" aria-label="Reset dat">
        <div class="modal-header">
          <h2>Reset dat</h2>

          <button class="modal-x" type="button" @click="$emit('close')" aria-label="Zavřít">
            ✕
          </button>
        </div>

        <p class="modal-text">
          Vyber, co chceš vymazat. Cache otázek můžeš nechat, aby zůstaly stejné otázky.
        </p>

        <div class="modal-actions">
          <button
            class="btn btn--danger"
            type="button"
            @click="$emit('reset-all')"
          >
            Vymazat všechno
          </button>

          <button
            class="btn btn--primary"
            type="button"
            @click="$emit('reset-progress')"
          >
            Vymazat jen statistiky a správnost
          </button>

          <button class="btn btn--ghost" type="button" @click="$emit('close')">
            Zrušit
          </button>
        </div>

        <p class="modal-hint">
          Tip: „Jen statistiky a správnost“ smaže: chybné otázky + statistiky + zodpovězené otázky.
          Otázky (cache) zůstanou.
        </p>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 9999;
}

.modal {
  width: min(560px, 100%);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.modal-x {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 8px 10px;
  cursor: pointer;
}

.modal-text {
  margin: 10px 0 14px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 600;
}

.modal-actions {
  display: grid;
  gap: 10px;
}

.modal-hint {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
}
</style>
