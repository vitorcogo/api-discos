const API_URL = 'https://ucsdiscosapi.azurewebsites.net/Discos';
const API_KEY = '8175fA5f6098c5301022f475da32a2aa';

let tokenApiUCS = '';
let number = 1;
let size = 12;
let maxItems = 105;

let recordList = [];
let currentScrollPosition = 0;
let isLoading = false;

const auth = () => {
  const url = `${API_URL}/autenticar`;
  $.ajax({
    url,
    type: 'POST',
    headers: {
      'ChaveApi': API_KEY
    },
    success: (token) => {
      tokenApiUCS = token;
      getRecords(false);
    },
    error: () => {
      showError();
    }
  });
};

const getRecords = (isScrollEvent) => {
  const loading = $('.loading');
  const content = $('.image-gallery');
  if (!isScrollEvent) {
    content.hide();
  }

  loading.show();

  const url = `${API_URL}/records`;
  $.ajax({
    url,
    type: 'GET',
    headers: {
      "TokenApiUCS": tokenApiUCS,
    },
    data: {
      numeroInicio: number,
      quantidade: size,
    },
    success: (records) => {
      isLoading = false;
      records.forEach(record => {
        recordList.push(record);
        const recordTemplate = `
          <div class="col-12 col-md-6 image-col">
            <div class="image-container" id="image-container" data-record-id="${record.id}">
              <img src="data:image/png;base64, ${record.imagemEmBase64}" alt="${record.id}" class="image-item" data-id="${record.id}">
            </div>
          </div>
        `;
        content.append(recordTemplate);
      });

      monitoryOpenRecordEvent();
      loading.hide();

      if (!isScrollEvent) {
        content.show();
        content.css('display', 'flex');
      } else {
        $(window).scrollTop(currentScrollPosition);
      }
    },
    error: () => {
      isLoading = false;
      showError();
    },
  });
};

const getRecord = (id) => {
  const modalElement = document.getElementById('modal');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();

  const modalLoading = $('#modal-loading');
  modalLoading.show();

  const url = `${API_URL}/record`;
  $.ajax({
    url,
    type: 'GET',
    headers: {
      "TokenApiUCS": tokenApiUCS,
    },
    data: {
      numero: id,
    },
    success: function (record) {
      const modalBody = $('#modal-body__content');
      const modalTemplate = `
        <img id="modalImage" src="data:image/png;base64, ${record.imagemEmBase64}" alt="Imagem do álbum" class="img-fluid">
        <p id="modalTitle">${record.descricaoPrimaria}</p>
        <p id="modalDescription">${record.descricaoSecundaria}</p>
        <p id="modalArtist"></p>
      `;
      modalBody.empty();
      modalLoading.hide();
      modalBody.append(modalTemplate);

      monitoryCloseModalEvent();
    },
    error: function () {
      const modalBody = $('#modal-body__content');
      modalBody.empty();

      setTimeout(() => {
        modalLoading.hide();
        modal.hide();
        showError();
      }, 500);
    },
  });
};

const monitoryOpenRecordEvent = () => {
  $('#imageGallery').on('click', '.image-container', function () {
    const record = $(this);
    const recordId = record.data('record-id');
    getRecord(recordId);
  });
};

$('#modal').on('click', '.btn-close', function () {
  debugger
  $('.modal-backdrop').remove();
});

const monitoryCloseModalEvent = () => {
  $("#modal").on("hide.bs.modal", function () {
    setTimeout(() => {
      $('.modal-backdrop').remove();
      $('body').css({
        'padding-right': '',
        'overflow': ''
      });
    }, 500);
  });
};

const showError = () => {
  const toastLiveExample = document.getElementById('liveToast');

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
  toastBootstrap.show();

  setTimeout(() => {
    toastBootstrap.hide();
  }, 5000);
};

const getPageOptions = () => {
  let total = recordList.length % maxItems;

  number = number >= maxItems ? 1 : total + 1;
  size = number + size > maxItems ? maxItems - total : 4;
}

$(window).on('scroll', function () {
  setTimeout(() => {
    const scrollTop = $(window).scrollTop();
    const windowHeight = $(window).height();
    const documentHeight = $(document).height();
    
    if (scrollTop + windowHeight >= documentHeight - 1 && !isLoading) {
      currentScrollPosition = $(window).scrollTop();
      isLoading = true;

      getPageOptions();
      getRecords(true);
    }
  }, 2000);
});

auth();
