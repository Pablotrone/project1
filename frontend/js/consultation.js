document.addEventListener('DOMContentLoaded', () => {
    const consultationTypeButtons = document.querySelectorAll('.consultation-type');
    const oralTypeButtons = document.querySelectorAll('.oral-type');
    const formOral = document.getElementById('form-oral');
    const formWritten = document.getElementById('form-written');
    const formOralInperson = document.getElementById('form-oral-inperson');
    const formOralRemote = document.getElementById('form-oral-remote');

    function hideAllForms() {
        formWritten.classList.add('hidden');
        formOralInperson.classList.add('hidden');
        formOralRemote.classList.add('hidden');
    }

    consultationTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Снять активный класс со всех кнопок типа консультации
            consultationTypeButtons.forEach(b => b.classList.remove('active'));
            // Добавить активный к текущей кнопке
            btn.classList.add('active');

            if (btn.dataset.type === 'oral') {
                formOral.classList.remove('hidden');
                // Скрыть формы
                hideAllForms();
                // Снять активный класс у форматов устной консультации
                oralTypeButtons.forEach(b => b.classList.remove('active'));
            } else {
                formOral.classList.add('hidden');
                // Показать форму письменной консультации
                hideAllForms();
                formWritten.classList.remove('hidden');
                // Снять активный класс у форматов устной консультации
                oralTypeButtons.forEach(b => b.classList.remove('active'));
            }
        });
    });

    oralTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Снять активный класс со всех кнопок формата устной консультации
            oralTypeButtons.forEach(b => b.classList.remove('active'));
            // Добавить активный к текущей кнопке
            btn.classList.add('active');

            // Показать соответствующую форму и скрыть остальные
            hideAllForms();
            if (btn.dataset.format === 'inperson') {
                formOralInperson.classList.remove('hidden');
            } else if (btn.dataset.format === 'remote') {
                formOralRemote.classList.remove('hidden');
            }
        });
    });
});
